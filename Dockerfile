FROM node:9.2

RUN apt-get update && apt-get install -y zip

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN yarn

COPY . /app
RUN yarn build

EXPOSE 8080
CMD ["npm", "start"]
