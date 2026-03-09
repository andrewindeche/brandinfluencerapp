import { BehaviorSubject } from 'rxjs';
import { NotificationStatus, ProfileUpdateStatus, CampaignType } from './types';

export interface ErrorResponseData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: number;
  campaign: string;
  status: NotificationStatus;
  date?: string;
  message?: string;
}

export interface SubmissionType {
  _id: string;
  content: string;
  submittedAt?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  influencer: {
    _id: string;
    username: string;
    email?: string;
    profileImage?: string;
  };
}
export interface SubmissionStoreType {
  submissions$: BehaviorSubject<Record<string, SubmissionType[]>>;
  fetchSubmissions: (campaignId: string) => Promise<void>;
  addSubmission: (
    campaignId: string,
    content: string,
  ) => Promise<SubmissionType | null>;
  acceptSubmission: (
    campaignId: string,
    submissionId: string,
  ) => Promise<SubmissionType | null>;
  rejectSubmission: (
    campaignId: string,
    submissionId: string,
  ) => Promise<SubmissionType | null>;
}
export interface Influencer {
  alt: string;
  likes: number;
  image: string;
  name: string;
  message: string;
}

export interface ProfileUpdateState {
  status: ProfileUpdateStatus;
  error: string | null;
}

export interface ErrorResponse {
  code?: string;
  message?: string;
}

export interface NotificationType {
  id: number;
  campaignTitle: string;
  type: 'submission' | 'status';
  message: string;
  timestamp: string;
}

export interface AxiosCustomError {
  message: string;
  code?: string;
}

export interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: CampaignType | null;
  onCreate?: (newCampaign: CampaignType) => void;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export interface UserMenuProps {
  userName?: string;
  imageSrc?: string;
  onLogout?: () => void;
}

export interface TipBoxProps {
  tip: string;
  duration?: number;
}

export interface WithAuthProps {
  role: 'brand' | 'influencer' | 'admin' | 'superuser';
}

export interface NotificationsSectionProps {
  notifications: Notification[];
  show: boolean;
  toggleShow: () => void;
  message: string;
}

export interface NotificationWidgetProps {
  notifications: Notification[];
}

export interface NotificationCardProps {
  imageSrc: string;
  campaignName: string;
  status: 'accepted' | 'rejected';
  date: string;
  message: string;
}

export interface CampaignsSectionProps {
  campaigns: CampaignType[];
  expanded: { [key: string]: boolean };
  onExpandToggle: (title: string) => void;
  onCampaignAction: (title: string) => void;
  maxCharCount?: number;
  notificationOpen: boolean;
  joined: boolean;
}

export interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  imageSrc: string;
  message: string;
  onSubmit: (text: string) => void;
  joined: boolean;
}
