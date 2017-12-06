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

<<<<<<< HEAD
EXPOSE 3000
=======
# Need src and git during build process but not after
RUN rm -r /app/src
RUN rm -r /app/.git

EXPOSE 8080
>>>>>>> ae6faafc174a6c12fb499164b1f4259bfa91fced
CMD ["npm", "start"]
