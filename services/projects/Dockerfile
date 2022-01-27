FROM node:14

WORKDIR /srv
ADD . .
RUN npm install

EXPOSE 3000
CMD ["node", "--experimental-json-modules", "server.js"]