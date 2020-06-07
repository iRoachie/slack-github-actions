# slack-github-action

A no-config GitHub action that notifies slack of the status of your GitHub actions

![Demo](https://user-images.githubusercontent.com/5962998/83960496-60549b00-a857-11ea-8875-41d59cbef798.png)

## Supported Triggers

We currently support:

- `pull_request`
- `release`
- `push` (tags)

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

      - name: Notify
        uses: @iRoachie/slack-github-action
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          status: ${{ job.status }}
        if: always()
```

3. Create `SLACK_WEBHOOK` secret using [GitHub Action's Secret](https://developer.github.com/actions/creating-workflows/storing-secrets). You can [generate a Slack incoming webhook token from here.](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)
