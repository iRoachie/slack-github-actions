# slack-github-action

A no-config GitHub action that notifies slack of the status of your GitHub actions

![Screenshot](https://user-images.githubusercontent.com/5962998/83519907-ce414100-a4aa-11ea-9361-8bba65126fa4.png)

## Usage

You can use this action after any other action, however I recommend you put it as the last one. Here is an example setup of this action for a pull request:

Create a .github/workflows/test.yml file in your GitHub repo.
Add the following code to the slack-notify.yml file.

```yaml
name: Test

on:
  pull_request:
    branches:
      - master

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        
      - run: npm install
      - run: npm test

      - name: Notify
        uses: @iRoachie/slack-github-action
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          status: ${{ job.status }}
        if: always()
```

Create `SLACK_WEBHOOK` secret using [GitHub Action's Secret](https://developer.github.com/actions/creating-workflows/storing-secrets). [You can generate a Slack incoming webhook token from here.](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)
