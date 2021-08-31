# Slack Github Actions

A no-config GitHub action that notifies slack and cliq of the status of your GitHub actions

![Demo](https://user-images.githubusercontent.com/5962998/83960734-32248a80-a85a-11ea-813e-ae2f033d0fc7.png)

## Supported Triggers

We currently support:

- `pull_request`
- `release`
- `push` (tags, commits)
- `schedule`
- `create (branch)`
- `delete (branch)`

## Messages

All event messages will have these elements:

![Base Image](https://user-images.githubusercontent.com/5962998/83960101-c1c63b00-a852-11ea-8642-1b7fab22cc55.png)

1. Build Indicator - Will be green for successful, red for failed, yellow for cancelled
2. Author Github Profile and User - This is also a link their profile page
3. Workflow Name - Also a link to the run
4. Repository Name - Also a link
5. Timestamp

---

### Pull Requests

![Pull Request](https://user-images.githubusercontent.com/5962998/83960228-38b00380-a854-11ea-8353-1f5cf8cf5fc4.png)

1. Commit Hash - Also a link showing the changes between the base and ref
2. Pull Request Number and Title - Also a link to the Pull Request

---

### Releases

![Release](https://user-images.githubusercontent.com/5962998/83960288-40bc7300-a855-11ea-945d-d55008a41d39.png)

1. Commit Hash - Also a link showing all changes in the release
2. Release Title - Also a link to the release and notes. _If the release doesn't have a title the tag name will be used._

---

### Tags

![Tag](https://user-images.githubusercontent.com/5962998/83960351-e5d74b80-a855-11ea-9cb5-9eec2fc652d1.png)

1. Commit Hash - Also a link showing all changes since this tag and master
2. Tag name - Also a link to the tag

### Commits

![Commits](https://user-images.githubusercontent.com/5962998/85979786-1fabf580-b9af-11ea-88f7-1d71a08e14ee.png)

1. Commit Hash - Also a link showing combined changes of all commits for the push
2. Head Commit name - Name of last commit in the batch (can push multiple commits). Also a link to that commit.

### Schedule

![Schedule](https://user-images.githubusercontent.com/5962998/100900010-c9306f00-3498-11eb-9a56-3499d81f2523.png)

> Note that Schedule does not have the user as there's no commit information.

### Create

![Create](https://user-images.githubusercontent.com/5962998/104134782-22c26e00-5362-11eb-9855-d40b6fc1bf7d.png)

1. Branch Name - Also link to the branch.

### Delete

![Delete](https://user-images.githubusercontent.com/5962998/104859938-0ba1f400-58ff-11eb-8645-9c5cedac4bde.png)

1. Branch Name

## Usage

You can use this action after any other action, however I recommend you put it as the last one. Here is an example setup of this action for a pull request:

1. Create a `.github/workflows/test.yml` file in your GitHub repo.
2. Add the following code to the `test.yml` file.

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

      - uses: iRoachie/slack-github-actions@v2.3.0
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          status: ${{ job.status }}
        if: ${{ always() }}
```

3. Create `SLACK_WEBHOOK_URL` secret using [GitHub Action's Secret](https://developer.github.com/actions/creating-workflows/storing-secrets). You can [generate a Slack incoming webhook token from here.](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)

## Advanced Usage

Here's an example with jobs that run in parallel.

It does a few things:

- Lets us know when a status check didn't succeed
- If all jobs were successful, we'll send a message at the end

> Note that the status variable is omitted here.

```yaml
name: Test

on:
  pull_request:
    branches:
      - master

jobs:
  test:
    name: Jest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: yarn
      - run: yarn test

  lint:
    name: Eslint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: yarn
      - run: yarn lint

  notify:
    Name: Slack
    needs: [test, lint] # We only check after the others jobs have run
    if: always() # Always runs even if one of the builds fails
    runs-on: ubuntu-latest
    steps:
      - uses: iRoachie/slack-github-actions@v2.3.0
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
## Cliq Usage

Here's an example that posts to a cliq channel as well as slack.

The platforms input takes a comma delimited list of communication platforms to send the message to. Currently supported platforms are slack and cliq.

When using the cliq platform, the [`CLIQ_WEBHOOK_TOKEN`](https://www.zoho.com/cliq/help/platform/webhook-tokens.html) and [`CLIQ_CHANNEL`](https://www.zoho.com/deluge/help/cliq/zoho-cliq-integration-attributes.html#channel_name) environment variables are required. An environment variable for `CLIQ_HOST` is optional and defaults to cliq.zoho.eu

```yaml
name: Test

on:
  pull_request:
    branches:
      - master

jobs:
  test:
    name: Jest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: yarn
      - run: yarn test

  lint:
    name: Eslint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: yarn
      - run: yarn lint

  notify:
    Name: Slack
    needs: [test, lint]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: iRoachie/slack-github-actions@v2.3.0
        with:
          platforms: slack, cliq # notice cliq as well as slack specified as the platforms to notify
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }} # required for the slack platform
          CLIQ_WEBHOOK_TOKEN: ${{ secrets.CLIQ_WEBHOOK_TOKEN }} # required for the cliq platform
          CLIQ_CHANNEL: ${{ secrets.CLIQ_CHANNEL }} # required for the cliq platform
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}