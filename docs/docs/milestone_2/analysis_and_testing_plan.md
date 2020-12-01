---
id: analysis_and_testing_plan
title: Analysis and Testing Plan
sidebar_label: Analysis and Testing Plan
---

### Rolling Analysis and Testing Plan
- We at reScribe are of the philosophy that "move fast and break things" is an art form. So much so, that we manage to break something nearly every week! Jokes aside, the API and all modules attached to it experience frequent (sometimes breaking) updates. This necessitates a somewhat lax testing and analysis plan. In terms of quality assurance, we keep broken code away from the master branch, and segregate it to a series of development branches. These get quality checked as their being written, and then again just before they are merged into master and deployed. As for analysis, the entire system is conceptually evaluated about once per month to make sure that we are not developing code that has no clear goal. The NLP and web sections are what usually garner the most attention at these meetings. 
- Upon completion of a major feature which is merged into the development branch, the production system is checked for errors and they are recorded by the team to be addressed in their development branches
- We also keep a documentation branch which is a mirror of the main branch, this is so that deploying new documentation is quick.