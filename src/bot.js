"use strict";

const Github = require("./github");
const Slack = require("./slack");

class Bot {
  /**
   * @param {object} options
   * @param {function} callback
     */
  constructor (options, callback) {
    this.github = new Github();
    this.slack = new Slack(callback, options.appName, options.appIcon);
    this.teams = {};

    this.addTeams(options.teams)
      .askReviewOnCardMoved(options.progressColumn, options.reviewColumn)
      .askReviewByComment();
  }

  /**
     * @param teamId
     * @param teamName
     * @param channel
     * @returns {Bot}
     */
  addTeam (teamId, teamName, channel) {
    this.teams[teamName] = {
      teamId: teamId,
      teamName: teamName,
      channel: channel || "#general"
    };

    return this;
  }

  /**
   * @param {Array} teams
   * @returns {Bot}
   */
  addTeams (teams) {
    for (let team of teams) {
      this.addTeam(team.id, team.name, team.channel);
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
            link: `https://github.com/${issueRepository}/issues/${issueId}`
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
          link: `https://github.com/${issueRepository}/issues/${issueId}`
        },
        teamName
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
