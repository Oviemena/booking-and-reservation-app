# Development Stage
FROM node:20.11-alpine AS development

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./


# Set npm registry and increase fetch timeout
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

RUN npm install

COPY . .

RUN npm run build

# Production Stage
FROM node:20.11-alpine AS production

# Install build dependencies
RUN apk add --no-cache python3 make g++

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

CMD ["node", "dist/main"]