"use strict";

const Assert = require("chai").assert;
const lambda = require("./../index").handler;
const Faker = require("./faker");

Assert.isHttpResponse = (val, code, body) => {
  Assert.hasAllKeys(val, ["statusCode", "headers", "body"]);
  Assert.strictEqual(val.statusCode, code);
  Assert.include(val.headers, {"Content-Type": "application/json"});

  if (typeof body === 'string') {
    body = [body];
  }

  for (let string of body) {
    Assert.include(val.body, string);
  }
};

describe("Lambda", () => {
  let responses = [];

  const callback = (_, response) => {
    responses.push(response);
    // console.log(response);
  };

  process.env.BOT_CONFIG = JSON.stringify(Faker.botConfig());

  it("handles invalid http event", () => {
    responses = [];
    lambda({}, null, callback);

    Assert.isArray(responses);
    Assert.lengthOf(responses, 1);
    Assert.isHttpResponse(responses[0], 404, 'Not found');
  });

  it("handles silent get request", () => {
    responses = [];
    lambda({httpMethod: 'GET'}, null, callback);

    Assert.isArray(responses);
    Assert.lengthOf(responses, 1);
    Assert.isHttpResponse(responses[0], 200, 'OK');
  });

  it("handles card moving", () => {
    const event = Faker.projectCardMoved();

    responses = [];
    lambda({
      httpMethod: 'POST',
      headers: event.headers,
      body: JSON.stringify(event.payload)
    }, null, callback);

    Assert.isArray(responses);
    Assert.lengthOf(responses, 1);
    Assert.isHttpResponse(responses[0], 200, ['please review', '#foo']);
  });

  it("handles review request comment", () => {
    const event = Faker.reviewCommentCreated();

    responses = [];
    lambda({
      httpMethod: 'POST',
      headers: event.headers,
      body: JSON.stringify(event.payload)
    }, null, callback);

    Assert.isArray(responses);
    Assert.lengthOf(responses, 1);
    Assert.isHttpResponse(responses[0], 200, ['please review', '#foo']);
  });

  it("handles team re-review request comment", () => {
    const event = Faker.teamReviewCommentCreated();

    responses = [];
    lambda({
      httpMethod: 'POST',
      headers: event.headers,
      body: JSON.stringify(event.payload)
    }, null, callback);

    Assert.isArray(responses);
    Assert.lengthOf(responses, 1);
    Assert.isHttpResponse(responses[0], 200, ['please re-review', '#bar']);
  });
});
