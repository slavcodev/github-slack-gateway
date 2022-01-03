# Github-Slack Gateway

[![Software License][ico-license]][link-license]
[![Build Status][ico-travis]][link-travis]
[![Coverage Status][ico-coveralls]][link-coveralls]

API Gateway to redirect Github Webhooks to Slack.

## Install

1. Enable **Slack Incoming webhooks**
2. Create **AWS Lambda** function and upload the files
3. Add bot config in `.env.json`  or into environment variable `BOT_CONFIG`
4. Create `Lambda proxy` endpoint on the **AWS API Gateway**
5. Configure **Github webhook** 

## Config

The config example:

```json
{
  "hookPath": "/services/XXXYYYZZZ/ZZZYYYXXX/xyzxyzxyzxyzxyzxyzxyzxyzxyzxyz",
  "teams": [
    {
      "channel": "#channel_hash",
      "id": "FOOBARBAZ",
      "name": "team_name_in_slack",
      "githubTeamName": "team_name_in_github"
    }
  ],
  "progressColumn": 3036545,
  "reviewColumn": 3038366
}
```

- `hookPath`: Slack hook URL path where notification is posted
- `teams.*.channel`: Slack chanel ID where notification is posted
- `teams.*.id`: Slack group ID mentioned in notification
- `teams.*.name`: Slack group name mentioned in notification
- `teams.*.githubTeamName`: GitHub team name
- `progressColumn`: GitHub project column ID to monitor when cards moving from column to another
- `reviewColumn`: GitHub project column ID to monitor when cards moving from column to another

## Testing

```shell
npm test
```

## Contributing

Contributions are welcome and will be fully credited. Please see [CONTRIBUTING](.github/CONTRIBUTING.md) and [CODE OF CONDUCT](.github/CODE_OF_CONDUCT.md) for details.

## Credits

- [Veaceslav Medvedev](https://github.com/slavcodev)
- [All Contributors](../../contributors)

## License

The BSD 2-Clause License. Please see [LICENSE][link-license] for more information.

[ico-license]: https://img.shields.io/badge/License-BSD%202--Clause-blue.svg?style=flat-square
[ico-travis]: https://img.shields.io/travis/slavcodev/github-slack-gateway/master.svg?style=flat-square
[ico-coveralls]: https://coveralls.io/repos/slavcodev/github-slack-gateway/badge.svg?branch=master&style=flat-square

[link-license]: LICENSE
[link-travis]: https://travis-ci.org/slavcodev/github-slack-gateway
[link-coveralls]: https://coveralls.io/r/slavcodev/github-slack-gateway?branch=master
