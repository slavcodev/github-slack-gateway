"use strict";

const Assert = require("chai").assert;
const Github = require("./../src/github");
const Slack = require("./../src/slack");
const Bot = require("./../src/bot");

class NoopClient {
  constructor () {
    this.events = [];
  }
  send (message) {
    this.events.push(message);
  }
  flush () {
    const messages = this.events;
    this.events = [];

    return messages;
  }
}

class EventLogger {
  constructor () {
    this.events = [];
  }
  log (event) {
    this.events.push(event);
  }
  flush () {
    const events = this.events;
    this.events = [];

    return events;
  }
}

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
  const recorder = new EventLogger();
  const client = new NoopClient();
  const github = new Github(recorder);
  const slack = new Slack(client, "Badass");
  const bot = new Bot(github, slack);

  it("init default properties", () => {
    Assert.strictEqual(bot.github, github);
    Assert.strictEqual(bot.slack, slack);
    Assert.isObject(bot.teams);
  });

  it("adds the team from default channel", () => {
    bot.addTeam("1", "foo");

    Assert.isObject(bot.teams);
    Assert.hasAllKeys(bot.teams, ["foo"]);
    Assert.property(bot.teams, "foo", {
      teamId: "1",
      teamName: "foo",
      channel: "#general"
    });
  });

  it("adds the team", () => {
    bot.addTeam("1", "foo", "#foo");
    bot.addTeam("2", "bar", "#bar");

    Assert.isObject(bot.teams);
    Assert.hasAllKeys(bot.teams, ["foo", "bar"]);
    Assert.property(bot.teams, "foo", {
      teamId: "1",
      teamName: "foo",
      channel: "#foo"
    });
    Assert.property(bot.teams, "bar", {
      teamId: "2",
      teamName: "bar",
      channel: "#bar"
    });
  });

  it("subscribes on card moving", () => {
    bot.askReviewOnCardMoved(2038543, 2038567, "foo");

    Assert.lengthOf(github.handlers, 1);
  });

  it("subscribes on new comment", () => {
    bot.askReviewByComment();

    Assert.lengthOf(github.handlers, 2);
  });

  it("handles review request on card moved", () => {
    bot.handle({
      headers: { "X-GitHub-Event": "project_card" },
      payload: {
        action: "moved",
        changes: {
          column_id: {
            from: 2038543
          }
        },
        project_card: {
          column_id: 2038567,
          content_url: "https://api.github.com/repos/foo/bar/issues/150"
        },
        repository: {
          full_name: "foo/bar"
        },
        sender: {
          login: "slavcodev",
          url: "https://api.github.com/users/slavcodev",
          html_url: "https://github.com/slavcodev",
          avatar_url: "https://avatars1.githubusercontent.com/u/757721?v=4"
        }
      }
    });

    const events = recorder.flush();
    Assert.isArray(events);
    Assert.lengthOf(events, 1);
    Assert.isJsonSerializable(events[0]);

    const messages = client.flush();
    Assert.isArray(messages);
    Assert.lengthOf(messages, 1);
    Assert.isMessage(messages[0], "foo", "#foo", "please review");
  });

  it("handles review request on comment", () => {
    bot.handle({
      headers: { "X-GitHub-Event": "issue_comment" },
      payload: {
        action: "created",
        issue: {
          url: "https://api.github.com/repos/foo/bar/issues/150"
        },
        comment: {
          body: "please review"
        },
        repository: {
          full_name: "foo/bar"
        },
        sender: {
          login: "slavcodev",
          url: "https://api.github.com/users/slavcodev",
          html_url: "https://github.com/slavcodev",
          avatar_url: "https://avatars1.githubusercontent.com/u/757721?v=4"
        }
      }
    });

    const events = recorder.flush();
    Assert.isArray(events);
    Assert.lengthOf(events, 1);
    Assert.isJsonSerializable(events[0]);

    const messages = client.flush();
    Assert.isArray(messages);
    Assert.lengthOf(messages, 1);
    Assert.isMessage(messages[0], "foo", "#foo", "please review");
  });

  it("handles team re-review request on comment", () => {
    bot.handle({
      headers: { "X-GitHub-Event": "issue_comment" },
      payload: {
        action: "created",
        issue: {
          url: "https://api.github.com/repos/foo/bar/issues/150"
        },
        comment: {
          body: "bar please re-review"
        },
        repository: {
          full_name: "foo/bar"
        },
        sender: {
          login: "slavcodev",
          url: "https://api.github.com/users/slavcodev",
          html_url: "https://github.com/slavcodev",
          avatar_url: "https://avatars1.githubusercontent.com/u/757721?v=4"
        }
      }
    });

    const events = recorder.flush();
    Assert.isArray(events);
    Assert.lengthOf(events, 1);
    Assert.isJsonSerializable(events[0]);

    const messages = client.flush();
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
