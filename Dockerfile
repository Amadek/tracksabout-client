FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Force run commands below without caching
ARG CACHEBUST=$(date +%s)

CMD npm run build
