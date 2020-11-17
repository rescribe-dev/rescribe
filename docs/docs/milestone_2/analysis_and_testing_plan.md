---
id: analysis_and_testing_plan
title: Analysis and Testing Plan
sidebar_label: Analysis and Testing Plan
---

To create the anaconda environment initially, the following command was used: `conda create rescribe-nlp`, followed by `conda env export > environment.yml`. To activate the environment, run `conda env create --file environment.yml` to create conda env from environment file, and `conda activate rescribe-nlp` to start it. To deactivate the environment, run `conda deactivate`.

Once the environment is activated, packages can be installed and used with `conda install` commands. To update the environment.yml file, run `conda env export > environment.yml`.

To update all dependencies based on `environment.yml`, run `conda env update --file environment.yml --prune`.
