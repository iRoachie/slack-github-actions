import core from '@actions/core';
import notify, { JobStatus } from './notify';
import { getJobsStatus } from './multiple-jobs';
import { validatePlatforms, supportedPlatforms } from './supported-platforms';

async function run() {
  try {
    const { supported: platforms, unsupported: unsupportedPlatforms } =
      validatePlatforms();

    if (unsupportedPlatforms.length > 0) {
      throw new Error(
        `Unsupported notification platforms: ${unsupportedPlatforms}. Supported platforms are: ${supportedPlatforms}`
      );
    }

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (platforms.includes('slack') && !slackUrl) {
      throw new Error('Please set [SLACK_WEBHOOK_URL] environment variable');
    }

    const cliqToken = process.env.CLIQ_WEBHOOK_TOKEN;
    if (platforms.includes('cliq') && !cliqToken) {
      throw new Error('Please set [CLIQ_WEBHOOK_TOKEN] environment variable');
    }

    const cliqChannel = process.env.CLIQ_CHANNEL;
    if (platforms.includes('cliq') && !cliqChannel) {
      throw new Error('Please set [CLIQ_CHANNEL] environment variable');
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

    await Promise.all(
      platforms.map(async (platform) => {
        let url;
        if (platform === 'slack') {
          url = slackUrl;
        } else if (platform === 'cliq') {
          url = `https://cliq.zoho.eu/api/v2/channelsbyname/${cliqChannel}/message?zapikey=${cliqToken}`;
        }
        await notify(jobStatus as JobStatus, url, platform);
      })
    );
  } catch (error) {
    core.setFailed(error.message);
    core.debug(error.stack);
  }
}

run();
