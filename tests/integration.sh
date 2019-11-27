#!/bin/bash

set -e;

echo "Attempting to create a campaign...";

# set a timestamp 10 minutes in the future
timestamp=$(echo $(date +%s)*1000+10*60*1000 | bc $1);

postdata='{"sendMails":true,"unixTime":'${timestamp}',"subject":"Testing mail scheduler","recipients":["me@jeremypoole.ca"],"htmlEmail":"<!doctype html><html><body><h1>Testing</h1></body></html>","txtEmail":"Testing"}';

expectedCreateResponse='{"scheduled":true,"id":'${timestamp}'}';

createResponse=$(curl -sX POST http://localhost:8080/v1/send -H 'content-type: application/json' --data "${postdata}");

[[ $expectedCreateResponse == $createResponse ]] && echo "Campaign created successfully!" || (echo "Failed!!" && exit 1);

echo "Checking for pending campaign...";

pendingLength=$(curl -s localhost:8080/v1/pending | jq '.length');
pendingId=$(curl -s localhost:8080/v1/pending | jq '.pending[0].id');

[[ $pendingLength == 1 ]] && echo "... one campaign pending ..." || (echo "Error! No campaigns found" && exit 1);

[[ $pendingId == $timestamp ]] && echo "...pending campaign verified!" || (echo "Error! Expected ${timestamp}, got ${pendingId}" && exit 1);

echo "Attempting to cancel campaign...";

cancelResponse=$(curl -sX POST http://localhost:8080/v1/cancelPending -H 'content-type: application/json' --data '{"id":'${timestamp}'}');
cancelSuccess=$(echo $cancelResponse | jq -cM '.success');
cancelId=$(echo $cancelResponse | jq -cM '.cancelledId');

[[ $cancelSuccess == "true" ]] && echo "...successfully cancelled a campain..." || (echo "Error! Could not cancel campaign" && exit 1);
[[ $cancelId == $timestamp ]] && echo "... correct ID has been cancelled." || (echo "Wrong ID cancelled. Aborting" && exit 1);

echo "Checking pending campaigns again...";

pendingLength=$(curl -s localhost:8080/v1/pending | jq '.length');

[[ $pendingLength == 0 ]] && echo "...success. No pending campaigns. Tests passed" || (echo "Error! Should be zero pending campaigns, but saw ${pendingLength} instead" && exit 1);

exit 0;
