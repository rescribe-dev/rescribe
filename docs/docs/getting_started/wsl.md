---
id: wsl
title: WSL
sidebar_label: WSL
---

## mongodb

- [WSL Ubuntu mongo setup](https://github.com/microsoft/WSL/issues/796#issuecomment-611626709)
- start mongo with `sudo service mongod start`
- for the time being, [disable fast startup](https://github.com/microsoft/WSL/issues/5298)
- [connect to compass](https://superuser.com/a/1075682)
- install mongodb in wsl, and compass in windows. don't install mongodb in windows

## wsl 1

- issue with mongo install: [fix](https://github.com/microsoft/WSL/issues/4898#issuecomment-646790723)
- issue with ipc connect failed: [fix](https://stackoverflow.com/a/61692849/8623391)
- disable all real-time antivirus - Norton, Windows Defender, etc. when installing packages

## golang

The only way to get golang to work on wsl right now (as far as I can tell) is to have the repository saved on the windows filesystem, and to open the golang folder in windows. Just do everything for golang in windows.
