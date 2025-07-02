import { BehaviorSubject } from 'rxjs';
import axiosInstance, { setAuthToken } from './axiosInstance';

export type CampaignType = {
  id: string;
  title: string;
  instructions: string;
  images: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
};

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
      const { data } = await axiosInstance.get<CampaignType[]>('/campaign');
      campaignStore.setCampaigns(data);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  },

  createCampaign: async (
    newCampaign: Omit<CampaignType, 'id'>,
  ): Promise<CampaignType> => {
    try {
      const { data } = await axiosInstance.post<CampaignType>(
        '/campaign',
        newCampaign,
      );
      campaignStore.addCampaign(data);
      return data;
    } catch (err) {
      console.error('Failed to create campaign:', err);
      throw err;
    }
  },

  updateCampaign: async (id: string, updates: Partial<CampaignType>) => {
    try {
      const { data } = await axiosInstance.patch<CampaignType>(
        `/campaign/${id}`,
        updates,
      );
      const updated = campaigns$.value.map((c) => (c.id === id ? data : c));
      campaigns$.next(updated);
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
};
