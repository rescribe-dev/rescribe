FROM node:13

# Add Maintainer Info
LABEL maintainer="reScribe"

# Create app directory
WORKDIR /app

# Install app dependencies
# where available (npm@5+)
COPY package.json yarn.lock ./

RUN yarn install
# If you are building your code for production
# --only=production

# Copy app
COPY lib .

COPY .rescriberc.yml .
COPY swagger.yml /

EXPOSE 8080
CMD [ "node", "index.js" ]
