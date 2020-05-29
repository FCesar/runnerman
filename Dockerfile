FROM node:12.14.0-slim as base
    ENV APPDIR /usr/app
    ENV PORT 8010

    WORKDIR $APPDIR

    COPY . $APPDIR

FROM base as development
    ENV NODE_ENV development

    ENTRYPOINT ["./bin/runnerman.js", "-c runnerman-collection.postman_collection.json", "-s suites/"]

