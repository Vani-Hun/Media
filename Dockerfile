FROM node:14.17.3

WORKDIR /home/app
COPY package.json .
COPY . .
RUN npm install

CMD ["npm", "run", "start:dev"]