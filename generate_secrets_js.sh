#!/bin/bash
# Generates a blank secrets.js for you to put your fastmail user and pass into
set -e

if [ ! -f secrets.js ]; then
    echo "module.exports = {
    user: 'username@domain.com',
    pass: 'your_pass_here',
    to: 'target@domain.com'
};" > secrets.js
    echo "Done!"
    exit 0
else echo "Secrets.js already exists! Aborted"
    exit 1
fi
