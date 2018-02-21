# Github-Slack Gateway

[![Software License][ico-license]][link-license]
[![Build Status][ico-travis]][link-travis]
[![Coverage Status][ico-coveralls]][link-coveralls]

API Gateway to redirect Github Webhooks to Slack.

## Install

1. Enable **Slack Incoming webhooks**
1. Create **AWS Lambda** function and upload the files
2. Add environment variable `BOT_CONFIG` for the lambda function
3. Create `Lambda proxy` endpoint on the **AWS API Gateway**
4. Configure **Github webhook** 

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
