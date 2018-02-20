"use strict";

const Assert = require("chai").assert;
const Bot = require("./../src/bot");
const Faker = require("./faker");

Assert.isJsonSerializable = val => {
  Assert.strictEqual(val + "", val.toString());
};

Assert.isMessage = (val, team, channel, message) => {
  Assert.hasAllKeys(val, [
    "username",
    "icon_emoji",
    "link_names",
    "channel",
    "attachments"
  ]);
  Assert.equal(val["link_names"], 1);
  Assert.equal(val["channel"], channel);
  Assert.isArray(val["attachments"]);
  Assert.lengthOf(val["attachments"], 1);
  Assert.hasAllKeys(val["attachments"][0], [
    "color",
    "author_name",
    "author_link",
    "author_icon",
    "text",
    "fallback"
  ]);
  Assert.include(val["attachments"][0]["fallback"], "asked for review");
  Assert.include(val["attachments"][0]["text"], team);
  Assert.include(val["attachments"][0]["text"], message);
  Assert.isJsonSerializable(val);
};

describe("Bot", () => {
  let messages = [];

  const bot = new Bot(
    Faker.botConfig("Badass"),
    (message) => {
      messages.push(message);
      // console.log(message);
    }
  );

  it("init default properties", () => {
    Assert.isObject(bot.github);
    Assert.isObject(bot.slack);
    Assert.isObject(bot.teams);
    Assert.hasAllKeys(bot.teams, ["foo", "bar", "baz"]);
    Assert.property(bot.teams, "foo", {teamId: "1", teamName: "foo", channel: "#foo"});
    Assert.property(bot.teams, "bar", {teamId: "2", teamName: "bar", channel: "#bar"});
    Assert.property(bot.teams, "baz", {teamId: "3", teamName: "baz", channel: "#general"});
    Assert.lengthOf(bot.github.handlers, 2);
  });

  it("handles review request on card moved", () => {
    messages = [];
    bot.handle(Faker.projectCardMoved());

    Assert.isArray(messages);
    Assert.lengthOf(messages, 1);
    Assert.isMessage(messages[0], "foo", "#foo", "please review");
  });

  it("handles review request on comment", () => {
    messages = [];
    bot.handle(Faker.reviewCommentCreated());

    Assert.isArray(messages);
    Assert.lengthOf(messages, 1);
    Assert.isMessage(messages[0], "foo", "#foo", "please review");
  });

  it("handles team re-review request on comment", () => {
    messages = [];
    bot.handle(Faker.teamReviewCommentCreated());

    Assert.isArray(messages);
    Assert.lengthOf(messages, 1);
    Assert.isMessage(messages[0], "bar", "#bar", "please re-review");
  });

  it("fails on handle unknown event", () => {
    Assert.throws(
      () => {
        bot.handle({ headers: { "X-GitHub-Event": "unknown_event" } });
      },
      Error,
      "Unsupported event: unknown_event"
    );
  });
});
