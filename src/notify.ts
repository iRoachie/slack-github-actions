import got from 'got';
import core from '@actions/core';
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

  const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
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

    case 'workflow_run': {
      const commitMessage = context.payload.workflow_run.head_commit.message;
      const headCommit = {
        title: commitMessage.includes('\n')
          ? commitMessage.substring(0, commitMessage.indexOf('\n'))
          : commitMessage,
        url: context.payload.workflow_run.head_commit.url,
      };
      const commitUrl = `${context.payload.repository?.html_url}/commit/${commitId}`;
      // prettier-ignore
      return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${commitUrl}|${commitId}>) for Commit <${commitUrl}| ${headCommit.title}>`;
    }

    case 'push': {
      if (context.payload.ref.includes('tags')) {
        const pre = 'refs/tags/';
        const title = context.payload.ref.substring(pre.length);

        const tag = {
          title,
          commit: context.payload.compare,
          url: `${context.payload.repository?.html_url}/releases/tag/${title}`,
        };

        // prettier-ignore
        return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${tag.commit}|${commitId}>) for Tag <${tag.url}| ${tag.title}>`;
      }

      const commitMessage = context.payload.head_commit.message;
      const headCommit = {
        title: commitMessage.includes('\n')
          ? commitMessage.substring(0, commitMessage.indexOf('\n'))
          : commitMessage,
        url: context.payload.head_commit.url,
      };

      // Normal commit push
      return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${context.payload.compare}|${commitId}>) for Commit <${headCommit.url}| ${headCommit.title}>`;
    }

    case 'schedule': {
      return `Scheduled Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}>`;
    }

    case 'create': {
      if (context.payload.ref_type !== 'branch') {
        return null;
      }

      const pre = 'refs/heads/';
      const branchName = context.ref.substring(pre.length);
      const branchUrl = `${context.payload.repository.html_url}/tree/${branchName}`;

      return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> for Creation of Branch <${branchUrl}|${branchName}>`;
    }

    case 'delete': {
      if (context.payload.ref_type !== 'branch') {
        return null;
      }

      const branchName = context.payload.ref;
      return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> for Deletion of Branch \`${branchName}\``;
    }

    default:
      return null;
  }
};

/**
 * Sends message via slack
 */
const notify = async (status: JobStatus, url: string) => {
  const sender = context.payload.sender;

  const message = getMessage();
  core.debug(JSON.stringify(context));

  if (!message) {
    console.log(`We don't support the [${context.eventName}] event yet.`);
    return;
  }

  const attachment = {
    author_name: sender?.login,
    author_link: sender?.html_url,
    author_icon: sender?.avatar_url,
    color: jobParameters(status).color,
    footer: `<https://github.com/${process.env.GITHUB_REPOSITORY}|${process.env.GITHUB_REPOSITORY}>`,
    footer_icon: 'https://github.githubassets.com/favicon.ico',
    mrkdwn_in: ['text'],
    ts: new Date(context.payload.repository?.pushed_at).getTime().toString(),
    text: `${message} ${jobParameters(status).text}`,
  };

  if (context.eventName === 'schedule') {
    // Schedule event doesn't have a commit so we use the current time
    attachment.ts = new Date().getTime().toString();
  }

  const payload = {
    attachments: [attachment],
  };

  await got.post(url, {
    body: JSON.stringify(payload),
  });
};

export default notify;
