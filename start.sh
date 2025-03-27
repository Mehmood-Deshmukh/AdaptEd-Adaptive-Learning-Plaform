#!/bin/bash

tmux new-session -d -s client "cd client && npm i && npm run dev"

tmux new-session -d -s server "cd server && npm i && nodemon index.js"

tmux new-session -d -s python-server "cd python-server && source .venv/bin/activate && pip install -r requirements.txt && python server.py"

tmux ls

tmux attach -t client
tmux attach -t server
tmux attach -t python-server
