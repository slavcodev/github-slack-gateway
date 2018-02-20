"use strict";

const Bot = require('./src/bot');

exports.handler = (event, context, callback) => {
  const respond = (code, body) => callback(null, {
    statusCode: code,
    body: body,
    headers: {'Content-Type': 'application/json'},
  });

  const hook = () => {};

  const bot = new Bot(JSON.parse(process.env.BOT_CONFIG), hook);

  switch (event.httpMethod) {
    case 'GET':
      respond(200, 'OK');

      break;
    case 'POST':
      bot
        .handle({headers: event.headers, payload: JSON.parse(event.body)})
        .then(message => respond(200, JSON.stringify(message)))
        .catch(error => respond(400, error.message))
      ;

      break;
    default:
      respond(404, 'Page not found');
  }
};
