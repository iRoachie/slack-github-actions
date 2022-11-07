import { context, getOctokit } from '@actions/github';

const getJobs = async () => {
  const Octokit = getOctokit(process.env.GITHUB_TOKEN!);

  const { data } = await Octokit.actions.listJobsForWorkflowRun({
    ...context.repo,
    run_id: context.runId,
  });

  const currentJob = context.job;

  return data.jobs
    .map((a) => ({
      name: a.name,
      conclusion: a.conclusion,
    }))
    .filter((a) => a.name !== currentJob);
};

export const getJobsStatus = async () => {
  const jobs = await getJobs();

  if (jobs.some((a) => ['failure', 'timed_out'].includes(a.conclusion!))) {
    return 'failure';
  }

  if (jobs.some((a) => a.conclusion === 'cancelled')) {
    return 'cancelled';
  }

  return 'success';
};
