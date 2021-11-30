export declare type JobStatus = 'success' | 'failure' | 'cancelled';
/**
 * Sends message via slack
 */
declare const notify: (status: JobStatus, url: string) => Promise<void>;
export default notify;
