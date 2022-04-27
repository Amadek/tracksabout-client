
node {
  def container
  def containerArgs = [
    "--name tracksabout-client-build",
    "-e \"REACT_APP_TRACKSABOUT_API_URL=${TA_API_URL}\"",
    "-e \"REACT_APP_TRACKSABOUT_API_PUBLIC_KEY=${TA_API_PUBLIC_KEY}\"",
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
          archiveArtifacts '**'
          stash name: 'everything', includes: '**'
        }
      }
    }
  }

  stage('Deploy') {
    unstash 'everything'
    sh 'pwd'
    sh 'ls'
    sh 'mkdir -p /data/www/tracksabout-client'
    sh 'cp -r * /data/www/tracksabout-client'
  }
}
