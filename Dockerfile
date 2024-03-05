FROM node:16.14

WORKDIR /home/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm install -g @nestjs/cli

CMD ["npm", "start"]
