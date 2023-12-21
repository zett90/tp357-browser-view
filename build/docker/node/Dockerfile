# Use a lightweight Node.js image as the base
FROM node:20-alpine as main

# Expose port 3000
EXPOSE 3000
WORKDIR /app
FROM main as deploy
COPY ./app ./

# Set the working directory

RUN npm config set fetch-retries 3
RUN npm config set fetch-retry-mintimeout 100000
RUN npm config set fetch-retry-maxtimeout 600000

RUN npm install
RUN npm run build

# Start the application
CMD ["node", "server.mjs"]
