# Darkwire Server

This is the backend for Darkwire. It requires [darkwire-client](https://github.com/seripap/darkwire-client) in order to run.

## Development

```
$ yarn
$ yarn dev
```

A dev server is now running on port 3000.

## Building Docker Container

```
$ docker build -t dw-server .
$ docker run -p 80:3000 dw-server
```
