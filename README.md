# About
Web app client for managing music tracks hosted in TracksAbout API.

# First run
## Run locally
First you need to checkout this repo and create your own .env file in main repo's folder with set environment variables listed here (there you can find more about how set them properly).

Next you simply have to:
```sh
npm install
npm start
```

And that's it.

## Run in Docker
Docker in this project is dedicated for production or howl test environment in remote destination.

Built container here is responsible for building react app in isolated environment with specific version of node.
When react build is completed (React `npm run build` is used for that), container copies built static website to a folder `/data/www/tracksabout-client`.
The folder is shared with containers host, from can be deployed anywere.

To create TracksAbout Client container, first you have to create .env file with environemt variables (see how) in main folder repo.

Next you simply:
```sh
docker-compose --env-file=.env.production build # Creates minified react app for production. For --env-file, .env file is default.
docker-compose up # Copies minified react app to /data/www/tracksabout-client.
```

These commands use `docker-compose.yml` where app ports and shared volumes are defined. Docker Compose file is using .env file, which was created in earlier step.

After that, app is deployed to `/data/www/tracksabout-client` folder, from it can be accesed directly from browser or e.g. NGINX server.

# Environment variables
// TODO AP lepiej to opisac jak to poustawiac.
To set in _.env_ file:
1. HTTPS=true
1. SSL_CRT_FILE=../certs/localhost.crt
   SSL_KEY_FILE=../certs/localhost.key
1. REACT_APP_TRACKSABOUT_API_URL=api.example.com
1. DEBUG=tracksabout-client:*
