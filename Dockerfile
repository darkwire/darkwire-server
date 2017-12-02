FROM node:9.2

LABEL maintainer "Darkwire Team <info@darkwire.io>"

RUN apt-get update && apt-get install -y zip

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app

COPY . /app
RUN yarn

COPY . /app
RUN yarn build

EXPOSE 3000
CMD ["npm", "start"]
