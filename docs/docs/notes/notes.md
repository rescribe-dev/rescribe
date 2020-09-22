---
id: notes
title: "Asif's Notes"
sidebar_label: onboarding
---

Here is where we add notes during development.

yarn-dev = npm run
vscode multiple terminals is 
3 things to add a new notes file:
- add a new markdown 
- add the markdown file to sidebars 
- change the id to the name on the side

9/17

Google docusaurus

9/19

git rebase -i [branch] = this takes the differences in between your current branch and provided branch and merges them

google gatsby - a web framework based off react using graphql for creating good static websites

gatsby only supports vanilla js for config files. we use ts for web applications

web/src/html.tsx = main wrapper around all html pages

web/layouts = another wrapper underneath the html wrapper

web/pages = another wrapper around src/components/pages, pretty much no really content in these pages but instead in src/components/pages

src/locale/pages/loginMessages -> src/pages/login/* (all the files in their language) -> messages passed down to their page -> global transition store

src/components/templates = directory for dynamic page content (dynamic means that the path string can change)

dynamic path pages = web/gatsby/src/createPages.ts

redux is used for state management (web/gatsby/src/state)

We are querying for files for the object file properties in web/src/lib/search.graphql

fragment (...syntax) is taking all the fields that you are querying and expanding them (line 63 in search.graphql)

when the data model is generated, it produces a bunch of types. The types are nested. When I want to pass around the data, 
Code gen takes in graphql files, schema and outputs the graphql according to the schema and actually use types in the data generate file

Fragments force code gen to create a type for a portion of a query
Google react-strap and copy and paste components of user components

LazyLoadImaging = an image that is pixelated until it is in the focus of the client

In storybook, all the arguments have to be parameterized

Look into the grid system (reactstrap-grid)

reactbootstrap has incompatible link components - we use reactstrap

If I ever see a deprecated NOT FOUND from the http status code library, I replace {NOT FOUND} with statusCodes and add StatusCodes. to every NOT FOUND in the file

If I see a red squilly line, I can click on the quick fix and vscode will handle it

If you have more than 3+ properties, you should make it multi-line

1 third, 2 third
image into container
add margin underneath image (2rem)

You can only use className with text-center

em is a unit of measurement

api folder

- typegraph.ql = library that allows you to define the schema through typeql
- index file = entry file for these node applications
- require.main === module is equvalent to main == name
  - initializes config and logger
  - In config, they run several config files that 
  - cosmicConfig = looks for the yml file based of the apiName
normal environment -> .env -> rescribe variables (environment hierarchy)
bridge are http clients using axios
- allows us to use this client and allows us to go to the endpoint
- express is http server
- we are allowing multiple core origin. It prevents people from using your api/recribe.dev unless they do it from a proxy
Middleware
graphQLuploadExpress -> uploads files
Apollo Server -> uses express and handles all the stuff at the graphql endpoint
Adds graphql context to the actual request
Authentication
-google jwt (authentication key)
- token signed by our server for 2 hours
- add more scopes to the api
- site maps = list of links
- get a cookie to refresh tokens
- @Field tells graphql that this specific field is mandatory

fix the repositories page
add more information to the user profile page
create a new graphql endpoint to count the number of repos and projects there are





