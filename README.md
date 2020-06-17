# FbKaakka

<img src="https://image.flaticon.com/icons/png/512/92/92031.png" alt="crow" width="150" height="150" />

FbKaakka is a command-line tool that dig up old photos from your buddy's facebook profile and comment some random shit on them to reach 
in their firend's timeline.

# Installation

FbKaakka requires [Node.js](https://nodejs.org/en/download/) to run.

Install the dependencies.

```sh
$ git clone https://github.com/MaNaHyper/fbKaakka.git
$ cd fbKaakka
$ npm install
```
# Configuring and running

Add your facebook login credentials and comments to the "./config.js" file before running.

To run with face-detection.
```sh
$ node kaakka.js --victim=<id/username> --fd=true
```

Examples
```sh
$ node kaakka.js --victim=manthila.mallawa --fd=true
$ node kaakka.js --victim=24353623 --fd=true
```
Enjoy :D
