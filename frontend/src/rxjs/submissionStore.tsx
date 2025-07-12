import { BehaviorSubject } from 'rxjs';
import axiosInstance from '../rxjs/axiosInstance';
import { SubmissionType } from '../types';

interface SubmissionStoreType {
  submissions$: BehaviorSubject<Record<string, SubmissionType[]>>;
  fetchSubmissions: (campaignId: string) => Promise<void>;
  addSubmission: (
    campaignId: string,
    content: string,
  ) => Promise<SubmissionType | null>;
}

const submissions$ = new BehaviorSubject<Record<string, SubmissionType[]>>({});

export const submissionStore: SubmissionStoreType = {
  submissions$,

  async fetchSubmissions(campaignId: string) {
    try {
      const response = await axiosInstance.get(
        `/campaign/${campaignId}/submissions`,
      );
      const submissions = response.data as SubmissionType[];
      submissions$.next({
        ...submissions$.getValue(),
        [campaignId]: submissions,
      });
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  },

  async addSubmission(campaignId: string, content: string) {
    try {
      const response = await axiosInstance.post(
        `/campaign/${campaignId}/submissions`,
        {
          content,
        },
      );

      const newSubmission: SubmissionType = response.data;

      const currentSubmissions = submissions$.getValue()[campaignId] || [];
      const updated = {
        ...submissions$.getValue(),
        [campaignId]: [...currentSubmissions, newSubmission],
      };

      submissions$.next(updated);
      return newSubmission;
    } catch (error) {
      console.error('Failed to add submission:', error);
      return null;
    }
  },
};
