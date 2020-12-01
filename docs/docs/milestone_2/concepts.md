---
id: concepts
title: Concepts
sidebar_label: Concepts
---

### Concepts Considered
- To address the problem of "lost code", organization, and open source connectivity, several concepts were explored
  1. A system where users were able to name individual fragments of code and store those exclusively in local text files. They would be able to share these files with their friends "the old fashioned way" (email) so that they also had access to these code snippets. The program would have been entirely locally hosted on the users machine and would have been exclusively a VSCode extension. 
  2. A system where the user pre saves a series of code fragments from a directory and instead of remembering their names they would search for them with a structured query language. 
  3. A system where a "universal" API was developed around a system that would index entire repoistories of source code files while simultaneously maintaining the topological structure of the reposiotry and understanding the hierarchical relationships between source code fragments (functions belong to classes which belong to files). These fragments would then be searchable based off of their location topologically, or their individual structure (file / class / function name + raw text search for source code).