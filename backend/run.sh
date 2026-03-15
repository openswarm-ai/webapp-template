#!/bin/bash
# The comment above is shebang, DO NOT REMOVE
RUN_BACKEND_ABSPATH="$(readlink -f "${BASH_SOURCE[0]}")"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # echo "In macOS server sed START"
    # echo "SERVER_ABSPATH: $SERVER_ABSPATH"
    sed -i '' 's/\r//g' "$RUN_BACKEND_ABSPATH"
    # echo "In macOS server sed END"
else
    # echo "NOT in macOS server START"
    # echo "SERVER_ABSPATH: $SERVER_ABSPATH"
    sed -i 's/\r//g' "$RUN_BACKEND_ABSPATH"
    # echo "NOT in macOS server START"
fi
chmod +x "$RUN_BACKEND_ABSPATH"

BACKEND_DIR_ABSPATH="$(dirname "$RUN_BACKEND_ABSPATH")"

# --- Create virtual environment if it doesn't exist ---
VENV_DIR="$BACKEND_DIR_ABSPATH/.venv"
if [[ ! -d "$VENV_DIR" ]]; then
    formatted_echo --green "Creating virtual environment..."
    python -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"

# --- Install Python dependencies ---
echo "Installing dependencies..."
cd "$BACKEND_DIR_ABSPATH"
pip install -r requirements.txt
if [[ $? -ne 0 ]]; then
    echo "Error: Failed to install Python dependencies."
    exit 1
fi

# --- Start the backend server ---
echo "Starting backend server on http://0.0.0.0:8324 ..."
cd "$BACKEND_DIR_ABSPATH"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8324 --reload