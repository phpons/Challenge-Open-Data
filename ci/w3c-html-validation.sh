#!/bin/bash
# W3C validator API: http://validator.w3.org/docs/api.html

API="https://validator.w3.org/nu/";
OUT="json";
URL="$API?out=$OUT";
HEADERS="Content-Type: text/html; charset=utf-8; Accept: application/json"

DOC="src/index.html";

status=$(curl --write-out '%{http_code}' --silent --output /dev/null $API);

if [[ $status -ne "200" ]]; then
  echo "ERROR: response status code is $status";
  exit 1;
fi

response=$(curl -H "$HEADERS" --data-binary @$DOC $URL);
errors=$(echo $response | jq -r ".messages");

if [[ $errors != [] ]]; then
  echo $errors | jq .;
  exit 1;
fi
