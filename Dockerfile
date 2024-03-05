FROM node:16.14

WORKDIR /home/app

COPY package*.json ./

COPY . .

RUN npm install

# RUN npm install -g @nestjs/cli

CMD ["npm", "start"]
