"use strict";

class Faker {
  static botConfig(appName) {
    return {
      hookPath: "demo",
      appName: appName,
      appIcon: null,
      teams: [
        {id: '1', name: 'foo', channel: '#foo', githubTeamName: 'github-foo'},
        {id: '2', name: 'bar', channel: '#bar'},
        {id: '3', name: 'baz'},
      ],
      deployersTeam: "foo",
      progressColumn: 2038543,
      reviewColumn: 2038567
    };
  }
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
      headers: {"X-GitHub-Event": "issue_comment"},
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
    }
  }
  static commentDeleted() {
    return {
      headers: {"X-GitHub-Event": "issue_comment"},
      payload: {
        action: "deleted",
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
    }
  }
  static pullRequestMerged() {
    return {
      headers: {"X-GitHub-Event": "pull_request"},
      payload: {
        action: "closed",
        number: 100,
        pull_request: {
          url: "https://api.github.com/repos/baxterthehacker/public-repo/pulls/100",
          html_url: "https://github.com/baxterthehacker/public-repo/pull/100",
          number: 100,
          title: "Update the README with new information",
          merged_at: null,
          merged: true,
          base: {
            ref: "master"
          }
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
    }
  }
  static reviewRequested() {
    return {
      headers: {"X-GitHub-Event": "pull_request"},
      payload: {
        action: "review_requested",
        number: 100,
        pull_request: {
          url: "https://api.github.com/repos/baxterthehacker/public-repo/pulls/100",
          html_url: "https://github.com/baxterthehacker/public-repo/pull/100",
          number: 100,
          title: "Update the README with new information",
          merged_at: null,
          merged: true,
          base: {
            ref: "master"
          },
          requested_reviewers: [],
          requested_teams: []
        },
        requested_team: {name: "bar"},
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
    }
  }
  static reviewRequestedFromMappedTeam() {
    return {
      headers: {"X-GitHub-Event": "pull_request"},
      payload: {
        action: "review_requested",
        number: 100,
        pull_request: {
          url: "https://api.github.com/repos/baxterthehacker/public-repo/pulls/100",
          html_url: "https://github.com/baxterthehacker/public-repo/pull/100",
          number: 100,
          title: "Update the README with new information",
          merged_at: null,
          merged: true,
          base: {
            ref: "master"
          },
          requested_reviewers: [],
          requested_teams: []
        },
        requested_team: {name: "github-foo"},
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
    }
  }
}

module.exports = Faker;
