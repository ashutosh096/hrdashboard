import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@workspace/api-client-react';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  managedTeamId?: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  actualRole: UserRole | null;
  previewRole: UserRole | null;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setUserSession: (user: User, token: string) => void;
  setPreviewRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  actualRole: null,
  previewRole: null,
  login: async () => {},
  logout: () => {},
  setUserSession: () => {},
  setPreviewRole: () => {},
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
  const [actualRole, setActualRole] = useState<UserRole | null>(null);
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = (decodedUser: User | null, authToken: string | null) => {
    if (!decodedUser || !authToken) {
      setUser(null);
      setToken(null);
      setActualRole(null);
      setPreviewRoleState(null);
      localStorage.removeItem('hros_token');
      localStorage.removeItem('hros_preview_role');
      localStorage.removeItem('hros_active_role');
      return;
    }

    const realRole = decodedUser.role; // Authentic JWT role
    setActualRole(realRole);
    setToken(authToken);

    let activePreview = realRole;
    if (realRole === 'ADMIN') {
      const storedPreview = (localStorage.getItem('hros_preview_role') || localStorage.getItem('hros_active_role')) as UserRole | null;
      if (storedPreview && ['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(storedPreview)) {
        activePreview = storedPreview;
      }
    } else {
      localStorage.removeItem('hros_preview_role');
      localStorage.removeItem('hros_active_role');
    }

    setPreviewRoleState(activePreview);
    setUser({
      ...decodedUser,
      role: activePreview, // Used solely for client dashboard layout selection
    });
  };

  // Restore session & active preview role from localStorage or query param on app load
  useEffect(() => {
    async function initAuth() {
      const searchParams = new URLSearchParams(window.location.search);
      const queryToken = searchParams.get('token');

      let targetToken = queryToken || localStorage.getItem('hros_token');

      if (queryToken) {
        localStorage.setItem('hros_token', queryToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (targetToken) {
        const decodedUser = decodeJwtPayload(targetToken);
        if (decodedUser) {
          applySession(decodedUser, targetToken);

          // Verify with server that user account still exists in DB!
          try {
            const meRes = await fetchApi<{ user: User }>('/api/auth/me');
            if (meRes && meRes.user) {
              applySession({ ...decodedUser, ...meRes.user }, targetToken);
            } else {
              applySession(null, null);
            }
          } catch {
            applySession(null, null);
          }
        } else {
          applySession(null, null);
        }
      } else {
        applySession(null, null);
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  // Multi-tab session synchronization listener across open browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hros_token' || e.key === 'hros_preview_role' || e.key === 'hros_active_role') {
        const storedToken = localStorage.getItem('hros_token');
        if (storedToken) {
          const decodedUser = decodeJwtPayload(storedToken);
          applySession(decodedUser, storedToken);
        } else {
          applySession(null, null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass, rememberMe }),
      });

      localStorage.removeItem('hros_preview_role');
      localStorage.removeItem('hros_active_role');
      localStorage.setItem('hros_token', res.token);
      applySession(res.user, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserSession = (userData: User, authToken: string) => {
    localStorage.removeItem('hros_preview_role');
    localStorage.removeItem('hros_active_role');
    localStorage.setItem('hros_token', authToken);
    applySession(userData, authToken);
  };

  const setPreviewRole = (newRole: UserRole) => {
    if (actualRole !== 'ADMIN') {
      console.warn('[AUTH SECURITY]: Role preview switching is strictly restricted to ADMIN accounts.');
      return;
    }
    localStorage.setItem('hros_preview_role', newRole);
    setPreviewRoleState(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : null));
  };

  const logout = () => {
    localStorage.removeItem('hros_token');
    localStorage.removeItem('hros_preview_role');
    localStorage.removeItem('hros_active_role');
    applySession(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        actualRole,
        previewRole,
        login,
        logout,
        setUserSession,
        setPreviewRole,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
