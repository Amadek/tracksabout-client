
export default class Config {
  get tracksAboutApiUrl () { return process.env.REACT_APP_TRACKSABOUT_API_URL; }
  get tracksAboutApiPublicKey () { return process.env.REACT_APP_TRACKSABOUT_API_PUBLIC_KEY; }
}
