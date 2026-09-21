#!/usr/bin/env bash
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Linking the global \"brain-docgen\" / \"brain-docgen-gui\" commands..."
npm link

NPM_BIN="$(npm config get prefix)/bin"
case ":$PATH:" in
  *":$NPM_BIN:"*)
    ;;
  *)
    echo
    echo "\"$NPM_BIN\" isn't on PATH yet, so \"brain-docgen\" won't be found in a new terminal."
    RC_FILE="$HOME/.profile"
    case "$SHELL" in
      */zsh) RC_FILE="$HOME/.zshrc" ;;
      */bash) RC_FILE="$HOME/.bashrc" ;;
    esac
    LINE="export PATH=\"\$PATH:$NPM_BIN\""
    if ! grep -qxF "$LINE" "$RC_FILE" 2>/dev/null; then
      echo "$LINE" >> "$RC_FILE"
      echo "Added it to $RC_FILE — open a NEW terminal (or run: source $RC_FILE) for it to take effect."
    fi
    ;;
esac

echo
echo "brain-docgen is installed. It needs a BrAIn HTTP server running for whichever project you"
echo "point it at (brain --mode http --root <path>), plus one of: Ollama running locally, an"
echo "Anthropic API key, or any OpenAI-compatible endpoint."
echo
echo "  brain-docgen <path> [options]      generate docs for a file/folder"
echo "  brain-docgen-gui                   browser GUI instead"
echo "  npm run setup:ollama               optional: installs/starts Ollama, pulls a model"
echo
echo "See README.md for the full option list."
