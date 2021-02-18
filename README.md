<img alt="reScribe" src="https://rescribe.dev/logo.svg" style="max-width: 500px">

> a better way to search code

[Web](https://rescribe.dev) | [Docs](https://docs.rescribe.dev) | [Status](https://status.rescribe.dev) | [NPM](https://www.npmjs.com/package/@rescribe/cli) | [AUR](https://aur.archlinux.org/packages/rescribe-bin)

![License](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-green)

**Note:** All source files are protected by the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license, included in this directory. Users of this source code (located in this current directory and any sub-directories) may not violate the terms of said license.

[![Netlify Status](https://api.netlify.com/api/v1/badges/63eb1e80-d14d-4410-a514-4e39f9598710/deploy-status)](https://app.netlify.com/sites/rescribe/deploys)
[![Netlify Status](https://api.netlify.com/api/v1/badges/008527ea-a085-45a4-9d8b-d2e4f3e39886/deploy-status)](https://app.netlify.com/sites/rescribe-status/deploys)

**Note:** Netlify "failed" means either deployment failed or no applicable changes found in last commit.

[![codecov](https://codecov.io/gh/rescribe-dev/rescribe/branch/main/graph/badge.svg?token=FGYV3NYN8F)](https://codecov.io/gh/rescribe-dev/rescribe)

![Upload Docs](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Docs/badge.svg)
![Upload Website](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Website/badge.svg)
![Upload Api](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Api/badge.svg)
![Upload Antlr](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Antlr/badge.svg)
![Upload NLP Deployment](https://github.com/rescribe-dev/rescribe/workflows/Upload%20NLP%20Deployment/badge.svg)
![Run NLP Dataprocess Language](https://github.com/rescribe-dev/rescribe/workflows/Run%20NLP%20Dataprocess%20Language/badge.svg)
![Run NLP Dataprocess Library](https://github.com/rescribe-dev/rescribe/workflows/Run%20NLP%20Dataprocess%20Library/badge.svg)
![Run NLP Training Bert](https://github.com/rescribe-dev/rescribe/workflows/Run%20NLP%20Training%20Bert/badge.svg)
![Upload Prerender](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Prerender/badge.svg)
![Upload Update Sitemap](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Update%20Sitemap/badge.svg)
![Upload Update Currencies](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Update%20Currencies/badge.svg)
![Build Dataset Libraries Java](https://github.com/rescribe-dev/rescribe/workflows/Build%20Dataset%20Libraries%20Java/badge.svg)
![Upload Fast](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Fast/badge.svg)
![Upload CLI](https://github.com/rescribe-dev/rescribe/workflows/Upload%20CLI/badge.svg)
![Upload vscode](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Vscode/badge.svg)
![Upload Github](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Github/badge.svg)
![Upload Emails](https://github.com/rescribe-dev/rescribe/workflows/Upload%20Emails/badge.svg)
![Frontend Origin Request](https://github.com/rescribe-dev/rescribe/workflows/Frontend%20Origin%20Request/badge.svg)
![Frontend Viewer Request](https://github.com/rescribe-dev/rescribe/workflows/Frontend%20Viewer%20Request/badge.svg)
![Frontend Viewer Response](https://github.com/rescribe-dev/rescribe/workflows/Frontend%20Viewer%20Response/badge.svg)
![Docs Origin Request](https://github.com/rescribe-dev/rescribe/workflows/Docs%20Origin%20Request/badge.svg)
![Docs Viewer Response](https://github.com/rescribe-dev/rescribe/workflows/Docs%20Viewer%20Response/badge.svg)
![Test Code](https://github.com/rescribe-dev/rescribe/workflows/Test%20Code/badge.svg)

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/IU2gHt3Qn)



## things we need to do for java specifically right now for a one language demo :)

- elasticsearch requests are not typed rn, which leads to a bunch of random errors. elasticsearch builder should help to fix that
- debug with web & api
- refactor portions of api graph model to include field resolvers as needed
- in docs, development index run the curl command to get an ip address and then use that to view the output in your browser
- 

### how to do this 

- Need to spin up all of the produciton / dev servers and get data into elasticsearch (cloud develoepment servers)
- This means cloning random java repositories and indexing them under the dev user (no premissions, just a login we share, we dont want everything controled by one account)
- Search page - keep running until it works
- How do you run the website from cloud nine and view the output and how do you access the graphql playground from cloud 9
- we should write a guide on how to index things using the cli
- 





## things that we want to do

- refactor api graph model ( what is an api graph model ) graphql => makes a graph model 
  - everything is flat rn, which forces us to create extra requests to the api from web & all our other stuff
  - we can keep the flat attributes with the object id attributes, but add field resolvers to add the graph manually
  - project -> repository -> folder -> _ file _
  - project -> field resolver for repo, folder for files, etc
  - elasticsearch requests are not typed rn, which leads to a bunch of random errors. elasticsearch builder should help to fix that
  - sync between elastic and the database easily
  - simplify the logic for getting the data, ideally done during dev of website
  - simpify existing codebase so that everything is less fragmented 
  - nested fields in elastic query are slow so how do we handle that
  - maybe utilize a similar standard output structure to github's semantic ast trees



ensted is slow becuase we eprform multi match over each field and theyre all trigrams so it ends up beign a lot fo computation
we may need to do optimizaiton of elastic past what the out of box functionality is 


apprently you can convert from h5 to ast (we use h5 for antlr4 currently)

https://github.com/tree-sitter/tree-sitter  
https://github.com/github/semantic#technology-and-architecture

Elatic nested fields are:
    comments 
    variables
    imports 
    functions 
    classes 
each nested field ahs a parent as laid out in nested obejct
[id parent and location]
in elastic they are handled differently   this is how we highlight the individual matching object instead of the whole file 


think about optimizing the elastic fields for computation time instead of disk footprint
possibly more than one search type 
(classe, functions, libraries, etc...)



Everything will still be stored in a flat fashion in the database, just with graphql we will simulate making it a phat object for 
ease of query


This is what flat looks like: 
    {
        repostiory
            this id
            array of ids for children
        
        file 
            this id
            array of ids for each type of child 
            parent id 
        
        ...
        
    }

This is what phat looks like:
    repository -> [folder] -> [file] -> [class] -> [class functions]
                                     -> [standalone funcitons]
                                     -> [imports]
                                     -> package path
                                     
A field resolver is a block of code which runs when you query for a certain field -> basically lazy evaluation of a field in your data object
so we want to write lazy resolvers for each layer of this query


frontload the keyword search with keywords extracted from file documentaitno and definition names and use that to filter out the files along with public access
need a compressed representation of data 
+