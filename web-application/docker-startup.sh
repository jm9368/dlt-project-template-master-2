#!/bin/sh

# If the frontend must be served, build it

if [ $SERVE_FRONTEND != 'NO' ]
then
    cd /frontend
    npm run build
fi

# Run the backend

cd /backend

npm start
