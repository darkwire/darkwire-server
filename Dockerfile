FROM node:9.2

LABEL maintainer "Darkwire Team <hello@darkwire.io>"

RUN apt-get update && apt-get install -y zip

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app

COPY . /app
RUN yarn

COPY . /app
RUN yarn build

# Need src and git during build process but not after
RUN rm -r /app/src
RUN rm -r /app/.git

EXPOSE 3000

CMD ["npm", "start"]
