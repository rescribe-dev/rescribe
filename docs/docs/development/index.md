---
id: index
title: Development
sidebar_label: Development
---

## Things to avoid

Here's a list of things that should be avoided when developing code for rescribe:

- Commit `node_modules`. This folder can become insanely large and committing it can cause all subsequent git pulls to take forever.
- Commit environment files. These files hold api keys and sensitive information, that should not be added to source control for security concerns.
- Run `yarn install` or `npm install` where it shouldn't be run. These 2 commands generate `yarn.lock` and `package-lock.json` files, respectively, so if these commands are run where those files do not already exist, it will be confusing to the next person as to what command they should use. If you see `package-lock.json`, use `npm`, otherwise use `yarn`.
- Forget to lint. Always lint, and make sure the precommit hooks are running for git, so you won't have to worry about it in the future. Not linting code can result in inconsistent code styling and problems in the future.
- Add documentation to random places. All documentation should be added to the `docs/docs` folder. If it's added in other places, it will cause unnecessary deployment builds whenever the documentation needs to be changed. By keeping the documentation in one place, only the documentation website will rebuild when new documentation is added. Which is what we want. This means avoid having random `README.md` files everywhere.
- For web, you should really avoid using caching in chrome. Either figure out a way to disable it completely, or alternatively use Firefox private tabs, which always seem to work.
