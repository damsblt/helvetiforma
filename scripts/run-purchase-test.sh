#!/bin/sh

set -e

DEPLOY_URL=${1:-"https://helvetiforma-hghyqzgqa-damsblts-projects.vercel.app"}
CASE=${2:-"single_course_purchase"}

FILE="$(dirname "$0")/../test-data/purchase-workflow.json"

PAYLOAD=$(jq -c --arg name "$CASE" '.cases[] | select(.name==$name) | .request' "$FILE")

if [ -z "$PAYLOAD" ]; then
  echo "Test case not found: $CASE" >&2
  exit 1
fi

echo "Posting to $DEPLOY_URL/api/payment-success using case $CASE..." >&2
echo "$PAYLOAD" | curl -s -X POST "$DEPLOY_URL/api/payment-success" -H 'Content-Type: application/json' --data-binary @- | jq .


