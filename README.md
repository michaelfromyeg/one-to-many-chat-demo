# Liteboard One-to-Many Chat Demonstration
Demo of chat functionality for liteboard.io, a whiteboard-style app.

## Setup

### Depedencies
- Node.js, NPM
- Uses ejs, embedded JavaScript templating, I recommend using downloading a VSCode extension for syntax highlighting
  - Some more robust framework could be used in the actual app, but this is just for the demo
- Uses Socket.io (duh) and Express

### Locally
- At the project source, run `npm i`
- Then, run `npm run start-dev` to begin the development environment
- Run the client code with [this](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VSCode extension, or something similar. 
- Open the instance of your local server; mine runs at `localhost:5500/`

## TODOs
- Chat room functionality is working, need to enable one-to-many style communicaion
