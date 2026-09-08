import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@workspace/api-client-react';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employeeId?: string;
  managedTeamId?: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setUserSession: (user: User, token: string) => void;
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

function decodeJwtPayload(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));

    // Client-side expiry check: payload.exp (seconds) * 1000 < Date.now()
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      employeeId: payload.employeeId,
      managedTeamId: payload.managedTeamId,
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session & active role from localStorage or query param on app load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get('token');
    const storedRole = localStorage.getItem('hros_active_role') as 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | null;

    if (queryToken) {
      const decodedUser = decodeJwtPayload(queryToken);
      if (decodedUser) {
        if (storedRole) decodedUser.role = storedRole;
        localStorage.setItem('hros_token', queryToken);
        setUser(decodedUser);
        setToken(queryToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
        return;
      }
    }

    const storedToken = localStorage.getItem('hros_token');
    if (storedToken) {
      const decodedUser = decodeJwtPayload(storedToken);
      if (decodedUser) {
        if (storedRole) decodedUser.role = storedRole;
        setUser(decodedUser);
        setToken(storedToken);
      } else {
        // Clear invalid / expired token & lingering demo role
        localStorage.removeItem('hros_token');
        localStorage.removeItem('hros_active_role');
        setUser(null);
        setToken(null);
      }
    } else {
      // Clear lingering demo role when no token exists
      localStorage.removeItem('hros_active_role');
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      localStorage.setItem('hros_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserSession = (userData: User, authToken: string) => {
    localStorage.setItem('hros_token', authToken);
    setUser(userData);
    setToken(authToken);
  };

  const setRole = (newRole: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    if (!user) return;
    localStorage.setItem('hros_active_role', newRole);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        role: newRole,
      };
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hros_token');
    localStorage.removeItem('hros_active_role');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUserSession, setRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
