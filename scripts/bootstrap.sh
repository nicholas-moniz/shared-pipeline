#!/bin/bash
set -euo pipefail

if [[ -f "${GITHUB_WORKSPACE}/runtime.env" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* ]] && continue
    export "$key=$value"
  done < "${GITHUB_WORKSPACE}/runtime.env"
fi

exec bash -c "$*"
