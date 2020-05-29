DOCKER_STAGE ?= development
INTERACTIVE := $(shell [ -t 0 ] && echo i || echo d)
APPDIR = /usr/app
PWD=$(shell pwd)
PORT=8010
PORT_DEBUG=18010
NODE_DEBUG=*
CONTAINER_NAME=runnerman
DOCKER_DATE_TAG=$(shell date +%Y-%m)

setup: build-docker-image ## Install dependencies
ifeq ("$(wildcard ./env)","")
	@cp .env.default .env
endif

check-if-docker-image-exists:
ifeq ($(shell docker images -q ${CONTAINER_NAME}:date-${DOCKER_DATE_TAG} 2> /dev/null | wc -l | bc),0)
	@echo "Docker image not found, building Docker image first"; sleep 2;
	@make build-docker-image
endif

build-docker-image:
	@echo "Building docker image from Dockerfile"
	@docker build --no-cache --force-rm . --target ${DOCKER_STAGE} -t ${CONTAINER_NAME}:latest -t ${CONTAINER_NAME}:date-${DOCKER_DATE_TAG}

start: check-if-docker-image-exists ## Start project for development purporses
	@echo 'Running on http://localhost:$(PORT)'
	@docker run -t${INTERACTIVE} --rm -v ${PWD}:${APPDIR}:delegated --env-file=.env -p $(PORT):80 -p $(PORT_DEBUG):5858 -e DEBUG=$(NODE_DEBUG) -e USER_PERM=$(shell id -u):$(shell id -g) --name ${CONTAINER_NAME} ${CONTAINER_NAME}:latest

stop: ## Stops project
	@docker stop ${CONTAINER_NAME}
