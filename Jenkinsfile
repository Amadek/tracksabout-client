
node {
  def container
  def containerArgs = [
    "--name tracksabout-client-build",
    "--env \"REACT_APP_TRACKSABOUT_API_URL=${TA_API_URL}\"",
    "--env \"REACT_APP_TRACKSABOUT_API_PUBLIC_KEY=${TA_API_PUBLIC_KEY}\"",
    "--volume /data/www:/data/www"
  ].join(' ')

  docker.withRegistry("http:${DOCKER_REGISTRY_URL}") {
    stage('Build') {
      checkout scm
      container = docker.build("tracksabout-client:${env.BUILD_ID}")
    }

    container.inside(containerArgs) {
      stage('Archive') {
        dir('build') {
          sh 'ls'
          archiveArtifacts '**'
        }
      }

      stage('Deploy') {
        sh 'mkdir -p /data/www/tracksabout-client'
        sh 'rm -r * /data/www/tracksabout-client'
        sh 'cp -r build/* /data/www/tracksabout-client'
      }
    }
  }
}
