# Darkwire Server

This is the backend for Darkwire. It requires [darkwire-client](https://github.com/seripap/darkwire-client) in order to run.

## Development

```
$ yarn
```

### Start dev redis server

```
$ docker-compose up -d
```

### Start Dev Server

```
$ yarn dev
```

Darkwire server is running on default port 3000.

## Building Docker Container

```
$ docker build -t dw-server .
$ docker run -p 80:3000 dw-server
```
