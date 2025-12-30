---
title: Jenkins
description: Jenkins 継続的インテグレーション、Pipeline と自動デプロイ
order: 2
tags:
  - toolchain
  - cicd
  - jenkins
  - automation
---

# Jenkins

## Jenkins 概要

Jenkins はオープンソースの自動化サーバーで、ソフトウェアプロジェクトのビルド、テスト、デプロイの継続的インテグレーションと継続的デリバリーをサポートします。

```
Jenkins アーキテクチャ
├── Master - 制御ノード
│   ├── タスクスケジューリング
│   ├── 設定管理
│   └── Web インターフェース
├── Agent - 実行ノード
│   ├── ビルド実行
│   └── 分散ビルド
└── Plugin - プラグインエコシステム
    ├── ソースコード管理
    ├── ビルドツール
    └── デプロイ統合
```

## Pipeline

### 宣言的 Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        GO_VERSION = '1.21'
        DOCKER_REGISTRY = 'registry.example.com'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'go build -o app ./...'
            }
        }

        stage('Test') {
            steps {
                sh 'go test -v -coverprofile=coverage.out ./...'
            }
            post {
                always {
                    publishCoverage adapters: [coberturaAdapter('coverage.xml')]
                }
            }
        }

        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/myapp:${BUILD_NUMBER}")
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-credentials') {
                        docker.image("${DOCKER_REGISTRY}/myapp:${BUILD_NUMBER}").push()
                    }
                }
            }
        }
    }

    post {
        success {
            slackSend(color: 'good', message: "Build ${BUILD_NUMBER} succeeded")
        }
        failure {
            slackSend(color: 'danger', message: "Build ${BUILD_NUMBER} failed")
        }
    }
}
```

### スクリプト式 Pipeline

```groovy
node {
    def app

    stage('Clone') {
        checkout scm
    }

    stage('Build') {
        app = docker.build("myapp:${env.BUILD_ID}")
    }

    stage('Test') {
        app.inside {
            sh 'go test ./...'
        }
    }

    stage('Push') {
        docker.withRegistry('https://registry.example.com', 'docker-credentials') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }

    stage('Deploy') {
        if (env.BRANCH_NAME == 'main') {
            sh 'kubectl set image deployment/myapp myapp=myapp:${BUILD_NUMBER}'
        }
    }
}
```

## マルチブランチ Pipeline

```groovy
// マルチブランチ設定
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo "Building branch: ${env.BRANCH_NAME}"
                sh 'make build'
            }
        }

        stage('Test') {
            steps {
                sh 'make test'
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh 'make deploy-staging'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?'
                sh 'make deploy-production'
            }
        }
    }
}
```

## 並列ビルド

```groovy
pipeline {
    agent any

    stages {
        stage('Parallel Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'go test -v ./pkg/...'
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'go test -v ./integration/...'
                    }
                }
                stage('E2E Tests') {
                    agent {
                        docker {
                            image 'cypress/browsers:latest'
                        }
                    }
                    steps {
                        sh 'npm run test:e2e'
                    }
                }
            }
        }

        stage('Build Matrix') {
            matrix {
                axes {
                    axis {
                        name 'PLATFORM'
                        values 'linux', 'darwin', 'windows'
                    }
                    axis {
                        name 'ARCH'
                        values 'amd64', 'arm64'
                    }
                }
                excludes {
                    exclude {
                        axis {
                            name 'PLATFORM'
                            values 'windows'
                        }
                        axis {
                            name 'ARCH'
                            values 'arm64'
                        }
                    }
                }
                stages {
                    stage('Build') {
                        steps {
                            sh "GOOS=${PLATFORM} GOARCH=${ARCH} go build -o app-${PLATFORM}-${ARCH}"
                        }
                    }
                }
            }
        }
    }
}
```

## 共有ライブラリ

```groovy
// vars/buildGo.groovy
def call(Map config = [:]) {
    def goVersion = config.goVersion ?: '1.21'

    pipeline {
        agent any

        tools {
            go "go-${goVersion}"
        }

        stages {
            stage('Build') {
                steps {
                    sh 'go build ./...'
                }
            }
            stage('Test') {
                steps {
                    sh 'go test -v ./...'
                }
            }
        }
    }
}

// 共有ライブラリ使用
@Library('my-shared-lib') _

buildGo(goVersion: '1.21')
```

## 認証情報管理

```groovy
pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                // ユーザー名パスワード
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }

                // SSH キー
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh-key',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh 'ssh -i $SSH_KEY user@server "deploy.sh"'
                }

                // Secret ファイル
                withCredentials([file(
                    credentialsId: 'kubeconfig',
                    variable: 'KUBECONFIG'
                )]) {
                    sh 'kubectl apply -f manifests/'
                }
            }
        }
    }
}
```

## エージェント設定

```groovy
pipeline {
    agent {
        // Docker エージェント
        docker {
            image 'golang:1.21'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    // または Kubernetes エージェント
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: golang
                    image: golang:1.21
                    command:
                    - sleep
                    args:
                    - infinity
                  - name: docker
                    image: docker:dind
                    securityContext:
                      privileged: true
            '''
            defaultContainer 'golang'
        }
    }

    stages {
        stage('Build') {
            steps {
                container('golang') {
                    sh 'go build ./...'
                }
            }
        }
    }
}
```

## まとめ

Jenkins のポイント：

1. **Pipeline** - 宣言的/スクリプト式、コードとして設定
2. **マルチブランチ** - 自動ブランチ検出、差別化ビルド
3. **並列** - マトリックスビルド、並列テスト
4. **共有ライブラリ** - ビルドロジック再利用
5. **認証情報** - 機密情報の安全な管理
