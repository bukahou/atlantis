---
title: Jenkins
description: Jenkins 持续集成、Pipeline 与自动化部署
order: 2
tags:
  - toolchain
  - cicd
  - jenkins
  - automation
---

# Jenkins

## Jenkins 概述

Jenkins 是开源的自动化服务器，支持构建、测试和部署软件项目的持续集成和持续交付。

```
Jenkins 架构
├── Master - 控制节点
│   ├── 任务调度
│   ├── 配置管理
│   └── Web 界面
├── Agent - 执行节点
│   ├── 构建执行
│   └── 分布式构建
└── Plugin - 插件生态
    ├── 源码管理
    ├── 构建工具
    └── 部署集成
```

## Pipeline

### 声明式 Pipeline

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

### 脚本式 Pipeline

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

## 多分支 Pipeline

```groovy
// 多分支配置
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

## 并行构建

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

## 共享库

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

// 使用共享库
@Library('my-shared-lib') _

buildGo(goVersion: '1.21')
```

## 凭据管理

```groovy
pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                // 用户名密码
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }

                // SSH 密钥
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh-key',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh 'ssh -i $SSH_KEY user@server "deploy.sh"'
                }

                // Secret 文件
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

## 代理配置

```groovy
pipeline {
    agent {
        // Docker 代理
        docker {
            image 'golang:1.21'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    // 或 Kubernetes 代理
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

## 总结

Jenkins 要点：

1. **Pipeline** - 声明式/脚本式，代码即配置
2. **多分支** - 自动发现分支，差异化构建
3. **并行** - 矩阵构建，并行测试
4. **共享库** - 复用构建逻辑
5. **凭据** - 安全管理敏感信息
