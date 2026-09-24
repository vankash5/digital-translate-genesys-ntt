FROM node:18-alpine
ADD ssl package.json package-lock.json run-local.js  docs ./
RUN npm install
CMD npm start