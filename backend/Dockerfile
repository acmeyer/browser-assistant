FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
RUN yarn build
EXPOSE 8080
CMD ["node", "dist/server.js"]