import core from '@actions/core';
import notify, { JobStatus } from './notify';
import { getJobsStatus } from './multiple-jobs';

async function run() {
  try {
    const url = process.env.SLACK_WEBHOOK_URL;

    if (!url) {
      throw new Error('Please set [SLACK_WEBHOOK_URL] environment variable');
    }

    let jobStatus = core.getInput('status');

    if (!jobStatus) {
      if (!process.env.GITHUB_TOKEN) {
        throw new Error('Please pass in [GITHUB_TOKEN] environment variable');
      }

      jobStatus = await getJobsStatus();
    } else {
      if (!['success', 'failure', 'cancelled'].includes(jobStatus)) {
        throw new Error('Unknown job status passed in.');
      }
    }

    await notify(jobStatus as JobStatus, url);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
      core.debug(error.stack!);
    }
  }
}

run();
