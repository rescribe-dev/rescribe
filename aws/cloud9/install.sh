#!/bin/sh

set -e

rm README.md

sudo apt-get -y update && sudo apt-get -y upgrade
sudo apt-get install -y libbz2-dev

# create ssh key for ci/cd account
# see https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

ssh-keygen -t ed25519 -C "rescribe.dev@gmail.com"
cat ~/.ssh/id_ed25519.pub

# from https://stackoverflow.com/a/13364116/8623391
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts

# git lfs
# https://github.com/git-lfs/git-lfs/wiki/Installation
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
git lfs install

git clone git@github.com:rescribe-dev/rescribe.git

sudo add-apt-repository ppa:longsleep/golang-backports
sudo apt update
sudo apt install golang-go

# before next commands, you need to resize the volume in ec2, making it 30gb or something

wget https://repo.anaconda.com/archive/Anaconda3-2020.11-Linux-x86_64.sh

bash Anaconda3-*.sh
conda config --set auto_activate_base false

# install node
# from https://github.com/nodesource/distributions/blob/master/README.md
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g yarn
# TODO - stopped here

git config core.editor vim
git config user.name "rescribe"
git config user.email "rescribe.dev@gmail.com"

# pip environment
# from https://github.com/pyenv/pyenv-installer
curl https://pyenv.run | bash

# https://pipenv.pypa.io/en/latest/#install-pipenv-today
pip install --user pipenv

# install packages
yarn install

cd scripts/install
./git-secrets.sh
cd -

# create new terminal now

# create shared terminal
# see https://stackoverflow.com/a/25206998/8623391
tmux display-message -p '#S'
# tmux switch -t <id>
