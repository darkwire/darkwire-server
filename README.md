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

## Running Docker Container

```
$ docker run --name dw-redis -d redis
$ docker run --name dw-server -p 80:3000 --link dw-redis:redis dw-server
```
