export type UserRole = 'brand' | 'influencer' | 'admin' | 'unknown';

export type AuthFormState = {
  email: string;
  role: UserRole;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  profileImage?: string;
  bio?: string;
  category?: string;
  errors: Record<string, string>;
  submitting: boolean;
  success: boolean;
  serverMessage: string | null;
  roleDetected: boolean;
};

export type LoginResult =
  | { success: true; role: Exclude<UserRole, 'unknown'> }
  | { success: false; message: string; throttle?: true };

export type CampaignAPIResponse = {
  joined: boolean;
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
  joined?: boolean;
};

export type PasswordResetState = {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
  resetStatus: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
};

export type ProfileUpdateStatus = 'idle' | 'loading' | 'success' | 'error';

export type User = {
  username: string;
  name: string;
  email: string;
  role: 'brand' | 'influencer' | 'admin';
};

export type AuthState = {
  token: string | null;
  username: string | null;
  bio: string | null;
  profileImage: string | null;
};

export type NotificationStatus = 'accepted' | 'rejected' | 'new_submission';

export interface Notification {
  id: number;
  campaign: string;
  status: NotificationStatus;
  date: string;
  message: string;
}
