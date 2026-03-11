import { BehaviorSubject,combineLatest  } from 'rxjs';
import { map } from 'rxjs/operators';
import axiosInstance from '../rxjs/axiosInstance';
import { AxiosError } from 'axios';
import { SubmissionType, SubmissionStoreType } from '../interfaces';

export const submissions$ = new BehaviorSubject<
  Record<string, SubmissionType[]>
>({});

export const submissionSearchQuery$ = new BehaviorSubject<string>('');
export const currentCampaignId$ = new BehaviorSubject<string>('');

export const filteredSubmissions$ = combineLatest([
  submissions$,
  submissionSearchQuery$,
  currentCampaignId$
]).pipe(
  map(([allSubs, query, campaignId]) => {
    const subsForCampaign = allSubs[campaignId] || [];

    if (!query) return subsForCampaign;

    const q = query.toLowerCase();
    return subsForCampaign.filter(
      (s) =>
        s.influencer?.toString().includes(q) ||
        s._id?.toString().includes(q)
    );
  })
);

export const submissionStore: SubmissionStoreType = {
  submissions$,

  async fetchSubmissions(campaignId: string, query?: string) {
    try {
      const response = await axiosInstance.get(
        `/campaign/${campaignId}/submissions`,
        {
          params: query ? { search: query } : {},
        },
      );
      const submissions = (response.data.submissions || []) as SubmissionType[];
      submissions$.next({
        ...submissions$.getValue(),
        [campaignId]: submissions,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch submissions:', error);
    }
  },

  async addSubmission(campaignId: string, content: string) {
    try {
      const response = await axiosInstance.post(
        `/campaign/${campaignId}/submissions`,
        { content },
      );

      const newSubmission: SubmissionType = response.data;

      const currentSubmissions = submissions$.getValue()[campaignId] || [];
      const updated = {
        ...submissions$.getValue(),
        [campaignId]: [...currentSubmissions, newSubmission],
      };

      submissions$.next(updated);
      return newSubmission;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (
          error.response?.status === 400 &&
          typeof error.response.data?.message === 'string' &&
          error.response.data.message.toLowerCase().includes('join')
        ) {
          return null;
        }
      }
      return null;
    }
  },

  async acceptSubmission(campaignId: string, submissionId: string) {
    try {
      const response = await axiosInstance.patch(
        `/campaign/submissions/${submissionId}/accept`,
      );

      const updatedSubmission: SubmissionType = response.data;

      const currentSubmissions = submissions$.getValue()[campaignId] || [];
      const updatedSubmissions = currentSubmissions.map((s) =>
        s._id === submissionId ? updatedSubmission : s,
      );

      submissions$.next({
        ...submissions$.getValue(),
        [campaignId]: updatedSubmissions,
      });

      return updatedSubmission;
    } catch (error: unknown) {
      console.error('Failed to accept submission:', error);
      return null;
    }
  },

  async rejectSubmission(campaignId: string, submissionId: string) {
    try {
      const response = await axiosInstance.patch(
        `/campaign/submissions/${submissionId}/reject`,
      );

      const updatedSubmission: SubmissionType = response.data;

      const currentSubmissions = submissions$.getValue()[campaignId] || [];
      const updatedSubmissions = currentSubmissions.map((s) =>
        s._id === submissionId ? updatedSubmission : s,
      );

      submissions$.next({
        ...submissions$.getValue(),
        [campaignId]: updatedSubmissions,
      });

      return updatedSubmission;
    } catch (error: unknown) {
      console.error('Failed to reject submission:', error);
      return null;
    }
  },
};
