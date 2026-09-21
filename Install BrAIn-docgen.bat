@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo Installing dependencies...
call npm install
if errorlevel 1 goto :fail

echo Building...
call npm run build
if errorlevel 1 goto :fail

echo Linking the global "brain-docgen" / "brain-docgen-gui" commands...
call npm link
if errorlevel 1 goto :fail

for /f "delims=" %%p in ('npm config get prefix') do set NPM_PREFIX=%%p
echo %PATH% | find /i "%NPM_PREFIX%" >nul
if errorlevel 1 (
  echo.
  echo "%NPM_PREFIX%" isn't on PATH yet, so "brain-docgen" won't be found in a new terminal.
  echo Adding it now...
  setx PATH "%PATH%;%NPM_PREFIX%" >nul
  echo Done — open a NEW terminal for this to take effect.
)

echo.
echo brain-docgen is installed. It needs a BrAIn HTTP server running for whichever project you
echo point it at (brain --mode http --root ^<path^>), plus one of: Ollama running locally, an
echo Anthropic API key, or any OpenAI-compatible endpoint.
echo.
echo   brain-docgen ^<path^> [options]      generate docs for a file/folder
echo   brain-docgen-gui                    browser GUI instead
echo   npm run setup:ollama                optional: installs/starts Ollama, pulls a model
echo.
echo See README.md for the full option list.
pause
exit /b 0

:fail
echo.
echo Install failed — see the error above.
pause
exit /b 1
