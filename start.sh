#!/bin/bash

cd client
npm i
npm run dev &

cd ../server
npm i
nodemon index.js &

cd ../python-server
source .venv/bin/activate
pip -r install requirements.txt
python server.py
