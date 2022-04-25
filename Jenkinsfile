
node {
  docker.withRegistry("http:${DOCKER_REGISTRY_URL}") {
    def container = docker.image('node:16-alpine')
    def containerArgs = [
      "--name tracksabout-client-build",
      "-e \"REACT_APP_TRACKSABOUT_API_URL=${TA_API_URL}\"",
      "-e \"REACT_APP_TRACKSABOUT_API_PUBLIC_KEY=${TA_API_PUBLIC_KEY}\"",
      "--volume /data/www/tracksabout-client:/data/www/tracksabout-client"
    ].join(' ')

    container.inside(containerArgs) {
      stage('Build') {
        sh 'ls'
        sh 'node --version'
        sh 'npm ci'
        sh 'npm run build'
      }
      
      dir('build') {
        stage('Archive') {
          archiveArtifacts '**'
        }
        
        stage('Deploy') {
          sh 'cp -r * /data/www/tracksabout-client'
        }
      }
    }
  }
}
