"use strict";

const Assert = require("chai").assert;
const Bot = require("./../src/bot");
const Faker = require("./faker");

Assert.isJsonSerializable = val => {
  Assert.strictEqual(val + "", val.toString());
};

Assert.isMessage = (val, team, channel, message, altMessage) => {
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
  Assert.include(val["attachments"][0]["fallback"], altMessage);
  Assert.include(val["attachments"][0]["text"], team);
  Assert.include(val["attachments"][0]["text"], message);
  Assert.isJsonSerializable(val);
};

describe("Bot", () => {
  const bot = new Bot(Faker.botConfig("Badass"), () => {});

  it("init default properties", () => {
    Assert.isObject(bot.github);
    Assert.isObject(bot.slack);
    Assert.isObject(bot.teams);
    Assert.hasAllKeys(bot.teams, ["foo", "bar", "baz"]);
    Assert.property(bot.teams, "foo", {teamId: "1", teamName: "foo", channel: "#foo"});
    Assert.property(bot.teams, "bar", {teamId: "2", teamName: "bar", channel: "#bar"});
    Assert.property(bot.teams, "baz", {teamId: "3", teamName: "baz", channel: "#general"});
    Assert.lengthOf(bot.github.handlers, 3);
  });

  it("handles review request on card moved", () => {
    bot
      .handle(Faker.projectCardMoved())
      .then((message) => {
        Assert.isMessage(message, "foo", "#foo", "please review", "asked for review");
      })
    ;
  });

  it("handles review request on comment", () => {
    bot
      .handle(Faker.reviewCommentCreated())
      .then((message) => {
        Assert.isMessage(message, "foo", "#foo", "please review", "asked for review");
      })
    ;
  });

  it("handles team re-review request on comment", () => {
    bot
      .handle(Faker.teamReviewCommentCreated())
      .then((message) => {
        Assert.isMessage(message, "bar", "#bar", "please re-review", "asked for review");
      })
    ;
  });

  it("handles pr merged event", () => {
    bot
      .handle(Faker.pullRequestMerged())
      .then((message) => {
        //console.log(message);
        Assert.isMessage(message, "foo", "#foo", "merged, going to deploy", "noticed the merge");
      })
    ;
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

  it("fails on callback errors", () => {
    const bot = new Bot(Faker.botConfig("Badass"), () => {throw new Error("Callback error")});
    bot
      .handle(Faker.projectCardMoved())
      .catch((error) => {
        Assert.instanceOf(error, Error);
        Assert.strictEqual("Callback error", error.message);
      });
  });
});
