import got from 'got';
import { context } from '@actions/github';

export type JobStatus = 'success' | 'failure' | 'cancelled';

/**
 * Returns parameters depending on the status of the workflow
 */
const jobParameters = (status: JobStatus) => {
  return {
    success: {
      color: 'good',
      text: 'succeeded',
    },
    failure: {
      color: 'danger',
      text: 'failed',
    },
    cancelled: {
      color: 'warning',
      text: 'was cancelled.',
    },
  }[status];
};

/**
 * Returns message for slack based on event type
 */
const getMessage = () => {
  const eventName = context.eventName;

  const runUrl = `${context.payload.repository?.html_url}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const commitId = context.sha.substring(0, 7);

  switch (eventName) {
    case 'pull_request': {
      const pr = {
        title: context.payload.pull_request?.title,
        number: context.payload.pull_request?.number,
        url: context.payload.pull_request?.html_url,
      };

      const compareUrl = `${context.payload.repository?.html_url}/compare/${context.payload.pull_request?.head.ref}`;

      // prettier-ignore
      return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${compareUrl}|${commitId}>) for PR <${pr.url}| #${pr.number} ${pr.title}>`;
    }

    case 'release': {
      const release = {
        title: context.payload.release.name || context.payload.release.tag_name,
        url: context.payload.release.html_url,
        commit: `${context.payload.repository?.html_url}/commit/${context.sha}`,
      };
      // prettier-ignore
      return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${release.commit}|${commitId}>) for Release <${release.url}| ${release.title}>`;
    }

    default:
      return null;
  }
};

/**
 * Sends message via slack
 */
const notify = async (status: JobStatus, url: string) => {
  const repository = context.payload.repository;
  const sender = context.payload.sender;

  const message = getMessage();

  if (!message) {
    console.log(`We don't support the [${context.eventName}] event yet.`);
    return;
  }

  const payload = {
    attachments: [
      {
        author_name: sender?.login,
        author_link: sender?.html_url,
        author_icon: sender?.avatar_url,
        color: jobParameters(status).color,
        footer: `<${repository?.html_url}|${repository?.full_name}>`,
        footer_icon: 'https://github.githubassets.com/favicon.ico',
        mrkdwn_in: ['text'],
        ts: new Date(context.payload.repository?.pushed_at)
          .getTime()
          .toString(),
        text: `${message} ${jobParameters(status).text}`,
      },
    ],
  };

  await got.post(url, {
    body: JSON.stringify(payload),
  });
};

export default notify;
