---
id: needs_requirements_mapping
title: Needs Requirements Mapping
sidebar_label: Needs Requirements Mapping
---

## github actions

There are several scripts that can be run to trigger github actions. They can be found in the `scripts/actions` folder. These scripts run the actions on your local computer, and you should have at least 50 gb of disk space free (since the docker images become fairly large). The first step is to install the `act` command, using [these instructions](https://github.com/nektos/act#installation). For arch, it's `yay -Syu act-git`.

There are secrets that need to be added to the `.github/workflows/secrets` folder before the actions can be used. They should be in the google drive.
