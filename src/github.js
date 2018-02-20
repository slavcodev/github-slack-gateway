"use strict";

/**
 * GithubEvent.
 */
class GithubEvent {
  /**
     * @param id
     * @param type
     * @param payload
     */
  constructor (id, type, payload) {
    this.id = id;
    this.type = type;
    this.payload = payload;
  }

  /**
     * @returns {string}
     */
  toString () {
    return JSON.stringify(this, null, " ");
  }

  /**
     * @param headers
     * @param payload
     * @returns {GithubEvent}
     */
  static create (headers, payload) {
    const id = headers["X-GitHub-Delivery"] || Math.random();
    const type = headers["X-GitHub-Event"];

    switch (type) {
      case "project_card":
        return new ProjectCardEvent(id, payload);
      case "issue_comment":
        return new IssueCommentEvent(id, payload);
      default:
        throw new Error(`Unsupported event: ${type}`);
    }
  }
}

/**
 * ProjectCardEvent.
 */
class ProjectCardEvent extends GithubEvent {
  /**
     * @param id
     * @param payload
     */
  constructor (id, payload) {
    super(id, "project_card", payload);
  }

  /**
     * @param from
     * @param to
     * @returns {boolean}
     */
  isMoved (from, to) {
    return (
      this.payload.action === "moved" &&
      this.payload.changes.column_id.from === from &&
      this.payload.project_card.column_id === to
    );
  }
}

/**
 * IssueCommentEvent.
 */
class IssueCommentEvent extends GithubEvent {
  /**
     * @param id
     * @param payload
     */
  constructor (id, payload) {
    super(id, "issue_comment", payload);
  }

  /**
     * @returns {boolean}
     */
  isCreated () {
    return this.payload.action === "created";
  }

  /**
     * @param regexp
     * @returns {RegExpMatchArray | null}
     */
  isMatched (regexp) {
    return this.payload.comment.body.match(regexp);
  }
}

/**
 * Github.
 */
class Github {
  /**
     * @param logger
     */
  constructor (logger) {
    this.handlers = [];
    this.logger = logger;
  }

  /**
     * @param from
     * @param to
     * @param callback
     * @returns {Github}
     */
  onProjectCardMoved (from, to, callback) {
    this.handlers.push(event => {
      if (event instanceof ProjectCardEvent && event.isMoved(from, to)) {
        callback(event);
      }
    });

    return this;
  }

  /**
     * @param regexp
     * @param callback
     * @returns {Github}
     */
  onIssueCommentCreated (regexp, callback) {
    this.handlers.push(event => {
      let matches;

      if (
        event instanceof IssueCommentEvent &&
        event.isCreated() &&
        (matches = event.isMatched(regexp))
      ) {
        callback(matches, event);
      }
    });

    return this;
  }

  /**
     * @param headers
     * @param payload
     */
  handle (headers, payload) {
    const event = GithubEvent.create(headers, payload);

    this.logger.log(event);

    for (let handler of this.handlers) {
      handler(event);
    }
  }
}

module.exports = Github;
