import { context, getOctokit } from '@actions/github';

const getJobs = async () => {
  const Octokit = getOctokit(process.env.GITHUB_TOKEN!);

  const { data } = await Octokit.rest.actions.listJobsForWorkflowRun({
    ...context.repo,
    run_id: context.runId,
  });

  const currentJob = context.job;

  return data.jobs
    .map((a: any) => ({
      name: a.name,
      conclusion: a.conclusion,
    }))
    .filter((a: any) => a.name !== currentJob);
};

export const getJobsStatus = async () => {
  const jobs = await getJobs();

  if (jobs.some((a: any) => ['failure', 'timed_out'].includes(a.conclusion))) {
    return 'failure';
  }

  if (jobs.some((a: any) => a.conclusion === 'cancelled')) {
    return 'cancelled';
  }

  return 'success';
};
