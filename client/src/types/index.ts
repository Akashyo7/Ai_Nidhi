export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  isVerified: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  profession: string;
  goals: string[];
  brandingObjectives: string[];
  contextBox: string;
  socialMediaHandles: SocialMediaProfile[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaProfile {
  platform: string;
  handle: string;
  url: string;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  message?: string;
  timestamp?: string;
}