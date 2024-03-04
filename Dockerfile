FROM node:16.14

WORKDIR /home/app
COPY package.json .
COPY . .
EXPOSE 3000
RUN npm install

CMD ["npm", "start"]