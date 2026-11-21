#!/usr/bin/env bash
set -euo pipefail
case "${1:-fast}" in
  fast) echo 'ok' ;;
  phase) echo 'ok' && bun test ;;
  qa) bun test ;;
  ci) echo 'ok' && bun test ;;
  *) exit 2 ;;
esac
