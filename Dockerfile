FROM node:14

WORKDIR /app
COPY . .

RUN yarn && yarn add moment && yarn add vis-util && npm run build --prod --build-optimizer
RUN npm run compress:brotli

WORKDIR /app/dist
COPY assets/CBC/client-assets/dist www/en/assets
RUN npm install --production
EXPOSE 3004

CMD [ "npm", "run", "serve:prod" ]
