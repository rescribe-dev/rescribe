#!/bin/bash

set -e

repo_name="repo"
cli_url="https://cli.rescribe.dev/linux.zip"

public_key_file="id_rsa_rescribe_aur.pub"
private_key_file="id_rsa_rescribe_aur"

if [ -n "$PUBLIC_KEY" ]; then
  printf "$PUBLIC_KEY" > "$public_key_file"
fi

if [ -n "$PRIVATE_KEY" ]; then
  printf "$PRIVATE_KEY" > "$private_key_file"
fi

ssh_key_files=($public_key_file $private_key_file)
update_ssh_keys=false
for ssh_file in "${ssh_key_files[@]}"
do
  if [ -f "$ssh_file" ] && [ ! -f "~/.ssh/$ssh_file" ]; then
    echo "copy $ssh_file to .ssh folder"
    cp $ssh_file ~/.ssh/$ssh_file
    chmod 600 ~/.ssh/$ssh_file
    update_ssh_keys=true
  fi
done

if [ "$update_ssh_keys" = true ]; then
  echo "update ssh keys"
  eval `ssh-agent -s`
  ssh-add ~/.ssh/$private_key_file
fi

if [ ! -d $repo_name ]; then
  if [ ! -n "$(grep "^aur.archlinux.org " ~/.ssh/known_hosts)" ]; then
    ssh-keyscan aur.archlinux.org >> ~/.ssh/known_hosts 2>/dev/null
  fi
  git clone ssh://aur@aur.archlinux.org/rescribe.git "$repo_name"
else
  cd "$repo_name"
  rm -rf *
  cd - &>/dev/null
fi

makepkg --printsrcinfo > "$repo_name/.SRCINFO"
cp PKGBUILD "$repo_name"
cp .default.rescriberc.yml "$repo_name/.rescriberc.yml"
cp rescribe.install "$repo_name"

temp_file="tmp.zip"

if [ ! -f $temp_file ]; then
  wget $cli_url -O $temp_file
fi

source_files=($temp_file)
hashes=()
for source_file in "${source_files[@]}"
do
  current_sum=$(md5sum $source_file | cut -d ' ' -f 1 )
  hashes+=($current_sum)
done
printf -v hashes_escaped '\"%s\" ' "${hashes[@]}"
hashes_escaped=${hashes_escaped::-1}

cd "$repo_name"
sed -i "s/md5sums=()/md5sums=($hashes_escaped)/g" PKGBUILD
cd - &>/dev/null

cd "$repo_name"
namcap PKGBUILD
cd - &>/dev/null

cd "$repo_name"
git add -A
git commit -m "updated rescribe cli package"
git push
cd - &>/dev/null