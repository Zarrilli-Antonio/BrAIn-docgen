#!/usr/bin/env bash
set -e

# Model to pull is a parameter, not hardcoded logic — swap it here (or pass one as $1) once a
# better default is picked; qwen3:8b is just what's on hand right now.
MODEL="${1:-qwen3:8b}"
OLLAMA_URL="http://localhost:11434"

if ! command -v ollama >/dev/null 2>&1; then
  case "$(uname -s)" in
    Darwin|Linux)
      echo "Ollama not found — installing (official installer)..."
      curl -fsSL https://ollama.com/install.sh | sh
      ;;
    *)
      echo "Ollama not found, and this script only automates macOS/Linux."
      echo "Install it from https://ollama.com/download, then re-run this script to pull $MODEL."
      exit 1
      ;;
  esac
else
  echo "Ollama already installed."
fi

if ! curl -fsS -m 2 "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
  echo "Starting Ollama..."
  nohup ollama serve >/tmp/ollama-serve.log 2>&1 &
  for _ in $(seq 1 20); do
    curl -fsS -m 1 "$OLLAMA_URL/api/tags" >/dev/null 2>&1 && break
    sleep 0.5
  done
  if ! curl -fsS -m 2 "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
    echo "Ollama didn't come up in time — check /tmp/ollama-serve.log and start it manually (ollama serve)."
    exit 1
  fi
else
  echo "Ollama already running."
fi

echo "Pulling $MODEL (first time can take a while)..."
ollama pull "$MODEL"

echo
echo "Ready: brain-docgen --provider local --model $MODEL"
