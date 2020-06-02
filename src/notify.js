import got from 'got';
import { context } from '@actions/github';

/**
 * @typedef {('success' | 'failure' | 'cancelled')} JobStatus
 */

/**
 * Returns parameters depending on the status of the workflow
 *
 * @param {JobStatus} status
 */
const jobParameters = (status) => {
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

  if (eventName === 'pull_request') {
    const pr = {
      title: context.payload.pull_request?.title,
      number: context.payload.pull_request?.number,
      url: context.payload.pull_request?.html_url,
    };

    const runUrl = `${context.payload.repository?.html_url}/actions/runs/${process.env.GITHUB_RUN_ID}`;

    // prettier-ignore
    return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${context.payload.repository?.compare_url}|${context.sha.substring(0, 7)}>) for PR <${pr.url}| #${pr.number} ${pr.title}>`;
  }
};

/**
 * Sends message via slack
 *
 * @param {JobStatus} status - Status of the job
 * @param {string} url - Slack url
 */
const notify = async (status, url) => {
  const repository = context.payload.repository;
  const sender = context.payload.sender;

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
        text: `${getMessage()} ${jobParameters(status).text}`,
      },
    ],
  };

  await got.post(url, {
    body: JSON.stringify(payload),
  });
};

export default notify;
