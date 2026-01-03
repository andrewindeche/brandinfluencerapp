import { BehaviorSubject } from 'rxjs';
import axiosInstance from '../rxjs/axiosInstance';
import { AxiosError } from 'axios';
import { SubmissionType, SubmissionStoreType } from '../types';

export const submissions$ = new BehaviorSubject<
  Record<string, SubmissionType[]>
>({});

export const submissionStore: SubmissionStoreType = {
  submissions$,

  async fetchSubmissions(campaignId: string) {
    try {
      const response = await axiosInstance.get(
        `/campaign/${campaignId}/submissions`,
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
        `/campaign/${campaignId}/submissions/${submissionId}/accept`,
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
        `/campaign/${campaignId}/submissions/${submissionId}/reject`,
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
