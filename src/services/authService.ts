import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api';
import { request } from './apiClient';

export const authService = {
  login(input: LoginRequest) {
    return request<AuthResponse>('/api/v1/auth/login', {
      authenticated: false,
      body: input,
      method: 'POST',
    });
  },
  register(input: RegisterRequest) {
    return request<User>('/api/v1/auth/register', {
      authenticated: false,
      body: input,
      method: 'POST',
    });
  },
};
