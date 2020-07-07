FROM node:13

# Add Maintainer Info
LABEL maintainer="Rescribe"

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

EXPOSE 8083

CMD [ "node", "index.js" ]
