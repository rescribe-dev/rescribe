---
id: requirements
title: Requirements
sidebar_label: Requirements
---

## Requirements

- As was hinted at in our [customers](https://docs.rescribe.dev/docs/milestone_1/customers) entry, the requirements for our two ideal customers would be similar. Importantly, our customer requirements fall into three main bins: **Organization**, **Open Source Recovery**, **Private Recovery**. These requirements all necessiate a robust search algorithm; this will not be discussed.

### Organization

- The customer would be able to organize large collecitons of code using reScribe. Their indexed repositories can be grouped into projects (with user authentication and access granted only to users who have been granted it). Those repositories will then contain mirrors of the actual repo's folders and files. What differentiates this from a simple file explorer is that: 
  - reScribe is hosted in the cloud, and therefore allows users to access content not available to their network locally 
  - reScribe supports search for repositories, filenames, filepaths, classes, class methods, and funcitons

### Private Recovery

- As mentioned, reScribe supports a robust search across several differnt important fields for source code. 
- With regards to content that is not open source, we have varying access levels for users. A repository can either be accessed only by the owner, read/write for one or more additional users, read only for one or more shared users, or a combination of both. This allows corporate clients to keep a level of confidentiality for certain repositories. 

### Open Source Recovery

- This is essentially the same as Private Recovery, except all content is open sourced. This includes any and all indexed repositories from GitHub or from other users who wish to share their creations online! This acts as a bridge between every individual developer, and the sum total of indexed open source code available. What is indexed isn't necesarrily specific answers to questions, but rather entire functional codebases and components. These can act as references or as direct contributions to the projects the user is working on
