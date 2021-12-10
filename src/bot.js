"use strict";

const Github = require("./github");
const Slack = require("./slack");

class Bot {
  /**
   * @param {object} options
   * @param {function?} callback
   */
  constructor (options, callback) {
    this.github = new Github();
    this.slack = new Slack(options, callback);
    this.teams = {};

    options.progressColumn = options.progressColumn || false;
    options.reviewColumn = options.reviewColumn || false;
    options.deployersTeam = options.deployersTeam || false;

    this.addTeams(options.teams)
      .noticeReviewRequested()
      .askReviewByComment();

    if (options.progressColumn && options.reviewColumn) {
      this.askReviewOnCardMoved(options.progressColumn, options.reviewColumn);
    }

    if (options.deployersTeam) {
      this.noticePullRequestMerge(options.deployersTeam);
    }
  }

  /**
     * @param teamId
     * @param teamName
     * @param channel
     * @param githubTeamName
     * @returns {Bot}
     */
  addTeam (teamId, teamName, channel, githubTeamName) {
    channel = channel || "#general";
    githubTeamName = githubTeamName || teamName;
    this.teams[teamName] = { teamId, teamName, githubTeamName, channel };

    return this;
  }

  /**
   * @param {Array} teams
   * @returns {Bot}
   */
  addTeams (teams) {
    for (let team of teams) {
      this.addTeam(team.id, team.name, team.channel, team.githubTeamName);
    }

    return this;
  }

  /**
     * @param inProgressColumnId
     * @param inReviewColumnId
     * @param teamName
     * @returns {Bot}
     */
  askReviewOnCardMoved (inProgressColumnId, inReviewColumnId, teamName) {
    teamName = teamName || Object.keys(this.teams)[0];

    this.github.onProjectCardMoved(
      inProgressColumnId,
      inReviewColumnId,
      event => {
        const issueId = event.payload.project_card.content_url.match(
          /(\d+)$/
        )[1];
        const issueRepository = event.payload.repository.full_name;

        return this.buildReviewRequest(
          "Please review",
          {
            name: event.payload.sender.login,
            link: event.payload.sender.html_url,
            icon: event.payload.sender.avatar_url
          },
          {
            id: issueId,
            repository: issueRepository,
            link: `https://github.com/${issueRepository}/pull/${issueId}`
          },
          teamName
        );
      }
    );

    return this;
  }

  /**
   * @returns {Bot}
   */
  askReviewByComment () {
    const teamNames = Object.keys(this.teams);
    const regexp = new RegExp(
      `(?:(${teamNames.join("|")}) )?please (re-)?review`,
      "i"
    );

    this.github.onIssueCommentCreated(regexp, (matches, event) => {
      const issueRepository = event.payload.repository.full_name;
      const issueId = event.payload.issue.url.match(/(\d+)$/)[1];

      const teamName = matches[1] || teamNames[0];
      const reviewRequest = matches[2] ? "Please re-review" : "Please review";

      return this.buildReviewRequest(
        reviewRequest,
        {
          name: event.payload.sender.login,
          link: event.payload.sender.html_url,
          icon: event.payload.sender.avatar_url
        },
        {
          id: issueId,
          repository: issueRepository,
          link: `https://github.com/${issueRepository}/pull/${issueId}`
        },
        teamName
      );
    });

    return this;
  }

  /**
   * @returns {Bot}
   */
  noticePullRequestMerge (teamName) {
    this.github.onPullRequestMerged(event => {
      const prRepository = event.payload.repository.full_name;
      const prId = event.payload.pull_request.number;

      return this.buildMergeNotice(
        "Just merged, going to deploy",
        {
          name: event.payload.sender.login,
          link: event.payload.sender.html_url,
          icon: event.payload.sender.avatar_url
        },
        {
          id: prId,
          repository: prRepository,
          link: `https://github.com/${prRepository}/pull/${prId}`
        },
        teamName
      );
    });

    return this;
  }

  /**
   * @returns {Bot}
   */
  noticeReviewRequested () {
    this.github.onReviewRequested(event => {
      const issueRepository = event.payload.repository.full_name;
      const prId = event.payload.pull_request.number;
      const requestedTeam = event.payload.requested_team;

      if (!requestedTeam || !requestedTeam.name) {
        return;
      }

      const team = Object.values(this.teams).find(
        o => o.githubTeamName === requestedTeam.name
      );

      if (!team) {
        return;
      }

      return this.buildReviewRequest(
        "Please review",
        {
          name: event.payload.sender.login,
          link: event.payload.sender.html_url,
          icon: event.payload.sender.avatar_url
        },
        {
          id: prId,
          repository: issueRepository,
          link: `https://github.com/${issueRepository}/pull/${prId}`
        },
        team.teamName
      );
    });

    return this;
  }

  /**
   * @param request
   * @returns {Promise<any>}
   */
  handle (request) {
    return this.slack.send(
      this.github.handle(request.headers, request.payload)
    );
  }

  /**
     * @param reviewRequest
     * @param author
     * @param issue
     * @param teamName
     * @returns {*}
     */
  buildReviewRequest (reviewRequest, author, issue, teamName) {
    return (
      this.slack
        .createMessage()
        // .useDefaultAppName()
        .setChannel(this.teams[teamName].channel)
        .addAttachment(
          this.slack
            .createAttachment()
            .setColor("good")
            .setAuthor(author.name, author.link, author.icon)
            .setText(
              `${_team(
                this.teams[teamName]
              )} ${reviewRequest.toLowerCase()} ${_issue(issue)}`,
              `${_user(author)} asked for review ${_issue(issue)}`
            )
        )
    );
  }

  /**
   * @param mergeNotice
   * @param author
   * @param pr
   * @param teamName
   * @returns {*}
   */
  buildMergeNotice (mergeNotice, author, pr, teamName) {
    return (
      this.slack
        .createMessage()
        // .useDefaultAppName()
        .setChannel(this.teams[teamName].channel)
        .addAttachment(
          this.slack
            .createAttachment()
            .setColor("good")
            .setAuthor(author.name, author.link, author.icon)
            .setText(
              `${_team(
                this.teams[teamName]
              )} ${mergeNotice.toLowerCase()} ${_issue(pr)}`,
              `${_user(author)} noticed the merge of the ${_issue(pr)}`
            )
        )
    );
  }
}

const _team = team => {
    return `<!subteam^${team.teamId}|@${team.teamName}>`;
  },
  _user = user => {
    return `<${user.link}|${user.name}>`;
  },
  _issue = issue => {
    return `<${issue.link}|${issue.repository}#${issue.id}>`;
  };

module.exports = Bot;
