#!/bin/bash
set -euo pipefail

if [[ -f "${GITHUB_WORKSPACE}/runtime.env" ]]; then
  echo "entered"
  cat "${GITHUB_WORKSPACE}/runtime.env"
  source "${GITHUB_WORKSPACE}/runtime.env"
fi

exec bash -c "$*"
