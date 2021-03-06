"use strict";

const Bot = require('./src/bot');
const fs = require('fs');

exports.handler = (event, context, callback, httpClient) => {
  const respond = (code, body) => callback(null, {
    statusCode: code,
    body: body,
    headers: {'Content-Type': 'application/json'},
  });
  const encode = (message) => {
    return typeof message === 'string'
      ? message
      : JSON.stringify(message);
  };

  const envPath = './.env.json';
  const envConfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : process.env.BOT_CONFIG;

  const bot = new Bot(JSON.parse(envConfig), httpClient);

  switch (event.httpMethod) {
    case 'GET':
      respond(200, 'OK');

      break;
    case 'POST':
      bot
        .handle({headers: event.headers, payload: JSON.parse(event.body)})
        .then(message => {
          return message || 'OK';
        })
        .then(message => encode(message))
        .then(message => respond(200, message))
        .catch(error => respond(400, error.message))
      ;

      break;
    default:
      respond(404, 'Page not found');
  }
};
