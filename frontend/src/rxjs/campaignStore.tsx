import { BehaviorSubject } from 'rxjs';
import axiosInstance, { setAuthToken } from './axiosInstance';

type CampaignAPIResponse = {
  _id: string;
  title: string;
  instructions: string;
  images: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
};

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
      }));
      campaignStore.setCampaigns(normalized);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
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
