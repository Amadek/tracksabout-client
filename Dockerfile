FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD npm run build && cp -r build/* /data/www/tracksabout-client/
