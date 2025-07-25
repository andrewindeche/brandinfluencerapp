import { BehaviorSubject, defer } from 'rxjs';
import axiosInstance, { setAuthToken } from './axiosInstance';
import { CampaignAPIResponse, CampaignType } from '../types';

const campaigns$ = new BehaviorSubject<CampaignType[]>([]);

export const campaignStore = {
  campaigns$,

  setCampaigns: (list: CampaignType[]) => campaigns$.next(list),

  addCampaign: (campaign: CampaignType) => {
    const current = campaigns$.value;
    campaigns$.next([...current, campaign]);
  },

  setAuth: (token: string | null) => {
    setAuthToken(token);
  },

  fetchCampaigns: async () => {
    try {
      const { data } =
        await axiosInstance.get<CampaignAPIResponse[]>('/campaign');
      const normalized: CampaignType[] = data.map((c) => ({
        id: c._id,
        title: c.title,
        instructions: c.instructions,
        images: c.images,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status,
        joined: c.joined || false,
      }));
      campaignStore.setCampaigns(normalized);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  },

  joinCampaign: (campaignId: string) => {
    return defer(async () => {
      const { data } = await axiosInstance.post(`/campaign/${campaignId}/join`);

      const updatedCampaign: CampaignType = {
        id: data.campaign._id,
        title: data.campaign.title,
        instructions: data.campaign.instructions,
        images: data.campaign.images,
        startDate: data.campaign.startDate,
        endDate: data.campaign.endDate,
        status: data.campaign.status,
      };

      const updatedList = campaigns$.value.map((c) =>
        c.id === updatedCampaign.id ? updatedCampaign : c,
      );

      campaigns$.next(updatedList);
      return data;
    });
  },

  createCampaign: async (
    newCampaign: Omit<CampaignType, 'id'>,
  ): Promise<CampaignType> => {
    try {
      const { data } = await axiosInstance.post<CampaignAPIResponse>(
        '/campaign',
        newCampaign,
      );

      const normalized: CampaignType = {
        id: data._id,
        title: data.title,
        instructions: data.instructions,
        images: data.images,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      };

      campaignStore.addCampaign(normalized);
      return normalized;
    } catch (err) {
      console.error('Failed to create campaign:', err);
      throw err;
    }
  },

  updateCampaign: async (id: string, updates: Partial<CampaignType>) => {
    try {
      const { data } = await axiosInstance.patch<CampaignAPIResponse>(
        `/campaign/${id}`,
        updates,
      );

      const normalized: CampaignType = {
        id: data._id,
        title: data.title,
        instructions: data.instructions,
        images: data.images,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      };

      const updatedList = campaigns$.value.map((c) =>
        c.id === id ? normalized : c,
      );
      campaigns$.next(updatedList);
    } catch (err) {
      console.error(`❌ Failed to update campaign [${id}]:`, err);
    }
  },

  deleteCampaign: async (id: string) => {
    try {
      await axiosInstance.delete(`/campaign/${id}`);
      const filtered = campaigns$.value.filter((c) => c.id !== id);
      campaigns$.next(filtered);
    } catch (err) {
      console.error(`❌ Failed to delete campaign [${id}]:`, err);
    }
  },

  fetchFilteredCampaigns: async (
    status?: 'active' | 'inactive',
    search?: string,
  ) => {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (search) params.search = search;

      const { data } = await axiosInstance.get<CampaignAPIResponse[]>(
        '/campaign',
        { params },
      );

      const normalized: CampaignType[] = data.map((c) => ({
        id: c._id,
        title: c.title,
        instructions: c.instructions,
        images: c.images,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status,
      }));

      campaignStore.setCampaigns(normalized);
    } catch (err) {
      console.error('❌ Failed to fetch filtered campaigns:', err);
    }
  },
};
