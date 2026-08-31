import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setUserSession: (user: User) => void;
  setRole: (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  setUserSession: () => {},
  setRole: () => {},
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start logged out so user can test the Option 2 Login page
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      setUser({
        id: 'user-1',
        email: email || 'admin@ehm-climagro.com',
        role: 'MANAGER',
        name: 'Sanjay Kapoor',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
      setToken('mock-jwt-token');
    } finally {
      setIsLoading(false);
    }
  };

  const setUserSession = (userData: User) => {
    setUser(userData);
    setToken('mock-jwt-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hros_token');
  };

  const setRole = (newRole: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUserSession, setRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
