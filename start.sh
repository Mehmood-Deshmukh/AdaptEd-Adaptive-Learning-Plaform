#!/bin/bash

cd client
npm run dev &

cd ../server
nodemon index.js &

cd ../python-server
source .venv/bin/activate
python server.py
