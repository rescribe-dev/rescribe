FROM node:15

# Add Maintainer Info
LABEL maintainer="reScribe"

# create app directory
WORKDIR /app

# Install app dependencies
# where available (npm@5+)
COPY package.json yarn.lock ./

RUN yarn install --only=production

# Copy app
COPY dist .

# disregard cache to activate
ARG CACHEBUST=1
RUN echo "$CACHEBUST"

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM datasets/libraries/java/lib/index.js
