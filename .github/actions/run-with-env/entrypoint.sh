#!/bin/bash
set -euo pipefail

if [[ -f runtime.env ]]; then
  source runtime.env
fi

exec bash -c "$@"
