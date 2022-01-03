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
      case "pull_request":
        return new PullRequestEvent(id, payload);
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
 * PullRequestEvent.
 */
class PullRequestEvent extends GithubEvent {
  /**
   * @param id
   * @param payload
   */
  constructor (id, payload) {
    super(id, "pull_request", payload);
  }

  /**
   * @returns {boolean}
   */
  isMergedToMaster () {
    return (
      this.payload.action === "closed" &&
      this.payload.pull_request.merged &&
      this.payload.pull_request.base.ref === "master"
    );
  }

  /**
   * @returns {boolean}
   */
  isReviewRequested () {
    return this.payload.action === "review_requested";
  }
}

/**
 * Github.
 */
class Github {
  /**
   * Constructor.
   */
  constructor () {
    this.handlers = [];
  }

  /**
   * @param from
   * @param to
   * @param callback
   * @returns {Github}
   */
  onProjectCardMoved (from, to, callback) {
    if (callback) {
      this.handlers.push(event => {
        if (event instanceof ProjectCardEvent && event.isMoved(from, to)) {
          return callback(event);
        }
      });
    }

    return this;
  }

  /**
   * @param regexp
   * @param callback
   * @returns {Github}
   */
  onIssueCommentCreated (regexp, callback) {
    if (callback) {
      this.handlers.push(event => {
        let matches;

        if (
          event instanceof IssueCommentEvent &&
          event.isCreated() &&
          (matches = event.isMatched(regexp))
        ) {
          return callback(matches, event);
        }
      });
    }

    return this;
  }

  /**
   * @param callback
   * @returns {Github}
   */
  onPullRequestMerged (callback) {
    if (callback) {
      this.handlers.push(event => {
        if (event instanceof PullRequestEvent && event.isMergedToMaster()) {
          return callback(event);
        }
      });
    }

    return this;
  }

  /**
   * @param callback
   * @returns {Github}
   */
  onReviewRequested (callback) {
    if (callback) {
      this.handlers.push(event => {
        if (event instanceof PullRequestEvent && event.isReviewRequested()) {
          return callback(event);
        }
      });
    }

    return this;
  }

  /**
   * @param headers
   * @param payload
   */
  handle (headers, payload) {
    const event = GithubEvent.create(headers, payload);
    let message;

    for (let handler of this.handlers) {
      message = handler(event);

      if (message) {
        return message;
      }
    }
  }
}

module.exports = Github;
