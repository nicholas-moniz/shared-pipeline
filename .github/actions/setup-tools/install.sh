#!/usr/bin/env bash

set -euo pipefail

METHOD="$1"       
NAME="$2"        
URL="$3"
BASH_ARGS="${4:-}"

if [[ "$METHOD" == "binary" ]]; then
  DEST="$TOOLS_DIR/$NAME"
  EVAL_URL=$(eval echo "$URL")
  curl -L -o "$DEST" "$EVAL_URL"
  chmod +x "$DEST"

elif [[ "$METHOD" == "bash" ]]; then
  curl -sL "$URL" | bash -s -- $BASH_ARGS

else
  echo "Unknown install method: $METHOD"
  exit 1
fi

echo "Installed $NAME to $TOOLS_DIR"
