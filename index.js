"use strict";

const Bot = require('./src/bot');

exports.handler = (event, context, callback) => {
  const error = (code, error) => {
    callback(null, {
      statusCode: code,
      body: error.message,
      headers: {'Content-Type': 'application/json'},
    });
  };

  const success = (body, code) => {
    callback(null, {
      statusCode: code || 200,
      body: body,
      headers: {'Content-Type': 'application/json'},
    });
  };

  const bot = new Bot(
    JSON.parse(process.env.BOT_CONFIG),
    (message) => {
      success(JSON.stringify(message));
    }
  );

  switch (event.httpMethod) {
    case 'GET':
      success('OK');

      break;
    case 'POST':
      bot.handle({headers: event.headers, payload: JSON.parse(event.body)});

      break;
    default:
      error(404, new Error(`Not found`));
  }

  return bot;
};
