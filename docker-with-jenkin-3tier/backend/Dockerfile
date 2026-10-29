FROM node:22-alpine

WORKDIR /backend

COPY package*.json .

RUN npm install

COPY . /backend/

EXPOSE 4000

CMD [ "npm", "start" ]
