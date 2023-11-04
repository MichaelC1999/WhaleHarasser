FROM node:14-alpine3.11
### install your dependencies if you have some
RUN mkdir /app && cd /app && npm install figlet@1.x && npm install axios
COPY ./src /app
ENTRYPOINT [ "node", "/app/app.js"]