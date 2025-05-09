#!/usr/bin/env bash

set -euo pipefail

NAME="$1"
URL="$2"
DEST_DIR="$3"

DEST="$DEST_DIR/$NAME"

curl -L -o "$DEST" "$URL"
chmod +x "$DEST"

echo "Installed $NAME to $DEST"
