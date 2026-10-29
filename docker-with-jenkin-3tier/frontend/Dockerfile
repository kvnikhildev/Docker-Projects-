FROM node:22-alpine

WORKDIR /Frontend

COPY . /Frontend/


RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]