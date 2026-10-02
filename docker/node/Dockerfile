FROM node:22.23.3-alpine

RUN npm install -g npm@12.2.2

ENV PATH=/var/www/app/node_modules/.bin:$PATH

CMD ["npm", "run", "start:dev"]
