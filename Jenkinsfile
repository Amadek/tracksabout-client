
node {
  stage ('Build') {
    checkout scm

    def container = docker.image('node:16-alpine')
    def containerArgs = [
      "-e \"REACT_APP_TRACKSABOUT_API_URL=${TA_API_URL}\"",
      "-e \"REACT_APP_TRACKSABOUT_API_PUBLIC_KEY=${TA_API_PUBLIC_KEY}\""
    ].join(' ')

    container.inside() {
      sh 'node --version'
      sh 'npm ci'
      sh 'npm run build'
      archiveArtifacts artifacts: 'build/*', followSymlinks: false
    }
  }
}
