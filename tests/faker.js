"use strict";

class Faker {
  static projectCardMoved() {
    return {
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
    };
  }
  static reviewCommentCreated() {
    return {
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
    };
  }
  static teamReviewCommentCreated() {
    return {
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
    };
  }
}

module.exports = Faker;
