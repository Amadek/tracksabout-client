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

# Environment variables
// TODO AP lepiej to opisac jak to poustawiac.
To set in _.env_ file:
1. HTTPS=true
1. SSL_CRT_FILE=../certs/localhost.crt
   SSL_KEY_FILE=../certs/localhost.key
1. REACT_APP_TRACKSABOUT_API_URL=api.example.com
1. DEBUG=tracksabout-client:*
