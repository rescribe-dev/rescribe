const name = 'Rescribe';
const version = '0.0.1';
const docsWebsite = 'https://docs.rescribe.dev';
const appWebsite = 'https://github.com/apps/rescribe-github';

export default `<!DOCTYPE html>
<html lang="en" class="height-full">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${name} | built with Probot</title>
    <link rel="stylesheet" href="https://probot.github.io/assets/css/index.css?d=1521919566">
  </head>
  <body class="height-full bg-gray-light">
    <div class="d-flex flex-column flex-justify-center flex-items-center text-center height-full">
      <img src="https://probot.github.io/assets/logo.png" alt="Probot Logo" width="100" class="mb-6">
      <div class="box-shadow rounded-2 border p-6 bg-white">
        <h1>
          Welcome to ${name}!
          <span class="Label Label--outline v-align-middle ml-2 text-gray-light">v${version}</span>
        </h1>
      </div>

      <div class="mt-4">
        <h4 class="alt-h4 text-gray-light">Need help?</h4>
        <div class="d-flex flex-justify-center mt-2">
          <a href="${docsWebsite}" class="btn btn-outline mr-2">Documentation</a>
          <a href="${appWebsite}" class="btn btn-outline mr-2">Documentation</a>
        </div>
      </div>
    </div>
  </body>
</html>
`;
