// Admin authentication utility
export interface AdminCredentials {
  email: string;
  password: string;
}

// Admin credentials (in production, this should be stored securely)
const ADMIN_CREDENTIALS: AdminCredentials = {
  email: 'airijapan1@gmail.com',
  password: 'NewStrongPassword123'
};

export const isAdmin = (email: string): boolean => {
  return email === ADMIN_CREDENTIALS.email;
};

export const validateAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
};

export const getAdminEmail = (): string => {
  return ADMIN_CREDENTIALS.email;
}; 