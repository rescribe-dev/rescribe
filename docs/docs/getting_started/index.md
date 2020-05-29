---
id: index
title: Getting Started
sidebar_label: Getting Started
---

## Steps to run everything

First clone the repository:

1. `git clone https://github.com/mdigreg2/rescribe`
2. `cd rescribe`

Then make sure your system time is correct. Otherwise the pings will not work. Make sure node.js and java jdk 8 is installed - you can use [this link](https://github.com/nodesource/distributions) for node and [this](https://openjdk.java.net/install/) for java. Next make sure yarn is installed [from here](https://classic.yarnpkg.com/en/docs/install).

Then optionally install git pre-commit hooks (required if developing). These hooks are used for linting files, ensuring code consistency and style guides: `npm install`

### antlr

Optionally run the antlr service, used for processing files that are going to be indexed:

1. `cd antlr`
2. Install antlr4 using your package manager (for ubuntu `sudo apt-get install antlr4`)
3. `./gen.sh`
4. `./precommit.sh`
5. `./gradlew run`
6. Install [google java format plugin](https://plugins.jetbrains.com/plugin/8527-google-java-format) and [lombok plugin](https://plugins.jetbrains.com/plugin/6317-lombok) in intellij to make life easier

View [this guide](https://github.com/com.rescribe.antlr/antlr4/blob/master/doc/getting-started.md) for getting antlr configured if there are any problems.

### api

First, if you're planning on developing, you should install mongodb locally. There are many examples of how to do it online, and you can even use a docker container. So google it. Then in the env file below, change the value of `DB_CONNECTION_URI` to `mongodb://localhost:27017/?readPreference=primary&ssl=false`.

To run the api, in a new terminal, run these commands:

1. in a new terminal: `cd api`
2. Download the correct `.env` file from [the drive](https://drive.google.com/drive/folders/1ZZhFu96jvGxrcdbPJ8U6hYke1cI3M-1b) and name it `.env`. Place it in the api folder. Change `ANTLR_URI` to false if you are not using the antlr service.
3. `yarn install`
4. `yarn build`
5. `yarn start`
6. [Open the graphql page](http://localhost:8080/graphql)

Example query:

```graphql
query hello {
  hello
}
```

Potential authorization [here](https://typegraphql.com/docs/authorization.html).

### web

To run the website, run these commands:

1. in a new terminal: `cd web`
2. Download the `.development.env` file from [the drive](https://drive.google.com/drive/folders/1ZZhFu96jvGxrcdbPJ8U6hYke1cI3M-1b) and name it `.development.env`. Place it in the web folder.
3. `yarn install`
4. `yarn codegen`
5. `yarn dev`
6. Navigate to http://localhost:8000/___graphql to view the graphql playground.
7. Navigate to http://localhost:8000 to view the website.

### github

To run the github app in development mode:

1. in a new terminal: `cd github-app`
2. Download the correct `.env` file from [the drive](https://drive.google.com/drive/folders/1ZZhFu96jvGxrcdbPJ8U6hYke1cI3M-1b) and name it `.env`. Place it in the github folder.
3. `yarn install`
4. `yarn codegen`
5. `yarn dev`

### cli

To run the cli:

1. in a new terminal: `cd cli`
2. Download the correct `.rescriberc.yml` file from [the drive](https://drive.google.com/drive/folders/1ZZhFu96jvGxrcdbPJ8U6hYke1cI3M-1b) and name it `.rescriberc.yml`. Place it in the cli folder.
3. Install krb5 following [these instructions](https://www.npmjs.com/package/krb5), with your package manager. See [this issue](https://github.com/nodegit/nodegit/issues/1134) for more information.
4. `npm install`
5. `npm run build`
6. `node lib`

Build cli using [these helpful libraries](https://yvonnickfrin.dev/seven-libraries-to-build-nodejs-cli). Use [this](`https://github.com/terkelg/prompts`) to prompt for user input.

### vscode

To run the vscode extension:

1. in a new terminal: `cd vscode`
2. `yarn install`
3. In the vscode IDE, click the run button on the left menu, and select `Run Extension`
