#!/bin/bash
set -euo pipefail

if [[ -f "${GITHUB_WORKSPACE}/runtime.env" ]]; then
  source "${GITHUB_WORKSPACE}/runtime.env"
  echo "${PATH}"
fi

exec bash -c "$*"
