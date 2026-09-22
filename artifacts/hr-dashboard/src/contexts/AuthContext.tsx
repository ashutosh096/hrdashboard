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
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeCode?: string;
  designation?: string;
  entityName?: string;
  entityCode?: string;
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
  updateProfile: (data: { name?: string; phone?: string; firstName?: string; lastName?: string }) => Promise<void>;
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
  updateProfile: async () => {},
  isLoading: false,
});

function decodeJwtPayload(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));

    // Check expiry
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
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hros_token') || null;
    } catch {
      return null;
    }
  });

  const [actualRole, setActualRole] = useState<UserRole | null>(() => {
    try {
      const stored = localStorage.getItem('hros_token');
      if (stored) {
        const decoded = decodeJwtPayload(stored);
        return decoded?.role || null;
      }
    } catch {}
    return null;
  });

  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(() => {
    try {
      const storedRole = (localStorage.getItem('hros_preview_role') || localStorage.getItem('hros_active_role')) as UserRole | null;
      if (storedRole && ['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(storedRole)) {
        return storedRole;
      }
    } catch {}
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedToken = localStorage.getItem('hros_token');
      if (storedToken) {
        const decoded = decodeJwtPayload(storedToken);
        if (decoded) {
          const storedPreview = (localStorage.getItem('hros_preview_role') || localStorage.getItem('hros_active_role')) as UserRole | null;
          const role = (decoded.role === 'ADMIN' && storedPreview) ? storedPreview : decoded.role;
          return { ...decoded, role };
        }
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    const realRole = decodedUser.role;
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
      role: activePreview,
    });
  };

  // Restore and verify session on app load
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

          // Background verification with /api/auth/me
          try {
            const meRes = await fetchApi<{ user: User }>('/api/auth/me');
            if (meRes && meRes.user) {
              applySession({ ...decodedUser, ...meRes.user }, targetToken);
            }
          } catch (err: any) {
            if (err?.message?.includes('no longer exists') || (err?.status === 401 && err?.message?.includes('Unauthorized'))) {
              applySession(null, null);
            }
          }
        } else {
          // Token expired, attempt refresh
          try {
            const refreshRes = await fetchApi<{ token: string; user: User }>('/api/auth/refresh', { method: 'POST' });
            if (refreshRes && refreshRes.token) {
              localStorage.setItem('hros_token', refreshRes.token);
              applySession(refreshRes.user, refreshRes.token);
            } else {
              applySession(null, null);
            }
          } catch {
            applySession(null, null);
          }
        }
      } else {
        applySession(null, null);
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  // Multi-tab session synchronization listener
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

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
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

  const updateProfile = async (data: { name?: string; phone?: string; firstName?: string; lastName?: string }) => {
    const res = await fetchApi<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res && res.user) {
      setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
    }
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
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
