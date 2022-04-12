FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["cp", "-r", "build/", "/data/www/tracksabout-client/"]