# FREQUENTLY ASKED QUESTIONS (read before flagging or commenting!)

- What is the difference between this package and the one in the community repo?
This is the binary distribution from reScribe. The one in the community repo is a build made from source.

- There is a new version out, why is the package not updated?
A tag on Github is NOT a release! If you can see the new version on the updates page but the AUR package is still not updated, flag it and give it time. It's usually done within a day or two.

- I'm using an AUR helper (yay, yaourt etc.) and I can't install it. Why?
Sometimes AUR helpers do weird things. Download [the tarball](https://aur.archlinux.org/cgit/aur.git/snapshot/rescribe-bin.tar.gz) and install it manually with makepkg -si. If that works, report the problem to your AUR helper's upstream, not here.

- Why is $X a dependency? I don't like it.
Just because $X is not required to open the app, doesn't mean there is nothing that depends on it. Always search the comment history on AUR to see if that dependency has been previously discussed before writing your own comment. Still nothing? Then use namcap to make sure it's really not needed. If namcap doesn't complain, please leave a comment here and I'll investigate.

- Something is broken with the app, where do I report it?
The problem might be a packaging issue (wrong paths, dependencies, icons), so please write a comment here first. If you don't get a reply, or if someone says it's an upstream issue, you can report it on Github.

- I have a problem with this package, can I email you?
No, you won't get a reply. Please stop doing this. Leave a comment here instead and be patient.
