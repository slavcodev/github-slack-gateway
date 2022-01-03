"use strict";

const Assert = require("chai").assert;
const Faker = require("./faker");
const lambda = require("./../index").handler;

Assert.isHttpResponse = (val, code, body) => {
  Assert.hasAllKeys(val, ["statusCode", "headers", "body"]);
  Assert.strictEqual(val.statusCode, code);
  Assert.include(val.headers, { "Content-Type": "application/json" });

  if (typeof body === "string") {
    body = [body];
  }

  for (let string of body) {
    Assert.include(val.body, string);
  }
};

describe("Lambda", () => {
  process.env.BOT_CONFIG = JSON.stringify(Faker.botConfig());
  const noop = () => {};

  it("handles invalid http event", () => {
    lambda(
      {},
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 404, "Page not found");
      },
      noop
    );
  });

  it("handles silent get request", () => {
    lambda(
      { httpMethod: "GET" },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, "OK");
      },
      noop
    );
  });

  it("handles card moving", () => {
    const event = Faker.projectCardMoved();

    lambda(
      {
        httpMethod: "POST",
        headers: event.headers,
        body: JSON.stringify(event.payload)
      },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, ["please review", "#foo"]);
      },
      noop
    );
  });

  it("handles review requesting", () => {
    const event = Faker.reviewRequested();

    lambda(
      {
        httpMethod: "POST",
        headers: event.headers,
        body: JSON.stringify(event.payload)
      },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, ["please review", "#bar"]);
      },
      noop
    );
  });

  it("handles review request comment", () => {
    const event = Faker.reviewCommentCreated();

    lambda(
      {
        httpMethod: "POST",
        headers: event.headers,
        body: JSON.stringify(event.payload)
      },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, ["please review", "#foo"]);
      },
      noop
    );
  });

  it("handles team re-review request comment", () => {
    const event = Faker.teamReviewCommentCreated();

    lambda(
      {
        httpMethod: "POST",
        headers: event.headers,
        body: JSON.stringify(event.payload)
      },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, ["please re-review", "#bar"]);
      },
      noop
    );
  });

  it("handles pull request merge notice", () => {
    const event = Faker.pullRequestMerged();

    lambda(
      {
        httpMethod: "POST",
        headers: event.headers,
        body: JSON.stringify(event.payload)
      },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, [
          "merged, going to deploy",
          "#foo"
        ]);
      },
      noop
    );
  });

  it("handles silent unsupported comment event", () => {
    const event = Faker.commentDeleted();

    lambda(
      {
        httpMethod: "POST",
        headers: event.headers,
        body: JSON.stringify(event.payload)
      },
      null,
      (_, response) => {
        Assert.isHttpResponse(response, 200, "OK");
      },
      noop
    );
  });
});
