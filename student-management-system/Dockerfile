
FROM node:22-alpine 

WORKDIR /app

#set environmet 
ENV NODE_ENV=production

#copy dependency file
COPY package*.json ./

#install the dependencies
RUN npm ci 

#copy application file and assign ownership
COPY --chown=node:node . . 

#run the application as non root user 
USER node

#applciation port
EXPOSE 3000

#start applciation 
CMD [ "npm", "start" ]

