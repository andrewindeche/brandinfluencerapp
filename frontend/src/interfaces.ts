import { BehaviorSubject } from 'rxjs';
import { ProfileUpdateStatus, CampaignType } from './types';

export interface ErrorResponseData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface BaseNotification {
  id: string;
  campaignId: string;
  submissionId: string;
  influencerId?: string;
  brandId?: string;
  message?: string;
}

export interface KafkaNotification extends BaseNotification {
  type: 'submission' | 'status';
  campaignTitle: string;
  timestamp: number;
  date: Date;
}

export interface Notification extends BaseNotification {
  campaign: string;
  status: "accepted" | "rejected"| 'new_submission';
  type?: 'submission.accepted' | 'submission.rejected' | 'submission.created';
  timestamp?: number;
  date: string;
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
  fetchSubmissions: (campaignId: string, query?: string) => Promise<void>;
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
  id: string;
  campaignTitle: string;
  type: 'accepted' | 'rejected' | 'new_submission';
  message: string;
  timestamp: string;
  campaignId: string;
  submissionId: string;
  influencerId?: string;
  brandId?: string;
  date: Date;
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
  notifications: NotificationType[];
  show: boolean;
  toggleShow: () => void;
  message: string;
}

export interface NotificationWidgetProps {
  notifications: NotificationType[];
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
  status: 'active' | 'inactive';
}
