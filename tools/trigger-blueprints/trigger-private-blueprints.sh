#!/bin/bash
## brief: trigger a downstream travis build
## see: travis API documentation

# variables
USER=wmfs
REPO=private-blueprints
BRANCH=master
MESSAGE=",\"message\": \"Triggered from upstream build of $TRAVIS_REPO_SLUG by commit "`git rev-parse --short HEAD`"\""

# curl POST request content body
BODY="{
  \"request\": {
  \"branch\":\"$BRANCH\"
  $MESSAGE
}}"

# make a POST request with curl (note %2F could be replaced with 
# / and additional curl arguments, however this works too!)
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token ${TRAVIS_TOKEN}" \
  -d "$BODY" \
  https://api.travis-ci.com/repo/${USER}%2F${REPO}/requests \
  | tee /tmp/travis-request-output.$$.txt

if grep -q '"@type": "error"' /tmp/travis-request-output.$$.txt; then
   cat /tmp/travis-request-output.$$.txt
   exit 1
elif grep -q 'access denied' /tmp/travis-request-output.$$.txt; then
   cat /tmp/travis-request-output.$$.txt
   exit 1
fi
