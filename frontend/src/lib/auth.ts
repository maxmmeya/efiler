import { api } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  institutionName?: string;
  institutionType?: string;
  userType?: 'EXTERNAL_INSTITUTIONAL' | 'BACK_OFFICE' | 'ADMINISTRATOR';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data));

    return data;
  },

  async signup(signupData: SignupData): Promise<void> {
    await api.post('/auth/signup', signupData);
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles.includes(role) || false;
  },

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions.includes(permission) || false;
  },
};
