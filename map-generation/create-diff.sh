#!/bin/env bash

set -uo pipefail

jq_script="walk(if type == \"array\" then sort else . end)"
file1=old/Map/map.json
file2=current/Map/map.json

diff -u5 --speed-large-files <(jq --sort-keys "$jq_script" < "$file1") <(jq --sort-keys "$jq_script" < "$file2")
ret=$?
if [ $ret -eq 0 ]; then
  echo "No diff in JSON file"
elif [ $ret -gt 1 ]; then
  echo "An error occurred!"
fi