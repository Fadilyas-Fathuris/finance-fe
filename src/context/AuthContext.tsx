import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Workspace } from '../Types';
import { api } from '../api';

type AuthContextType = {
  user: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  activeWorkspace: Workspace;
  setActiveWorkspace: (w: Workspace) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchUser: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_KEY = 'niskala_user';
const AUTH_WORKSPACE_KEY = 'niskala_workspace';

const isWorkspace = (value: string | null): value is Workspace => {
  return value === 'global' || value === 'niskala' || value === 'aksalab' || value === 'snapcala';
};

const readStoredUser = () => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_WORKSPACE_KEY);
    return null;
  }
};

const workspaceFromUser = (user: User, preferredWorkspace?: Workspace): Workspace => {
  if (user.role === 'CEO' || user.role === 'CFO') {
    return preferredWorkspace || 'global';
  }

  const identity = `${user.email} ${user.name}`.toLowerCase();
  if (identity.includes('aksalab')) return 'aksalab';
  if (identity.includes('snapcala')) return 'snapcala';
  return 'niskala';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>('global');

  useEffect(() => {
    async function initAuth() {
      const storedUser = readStoredUser();
      const storedWorkspace = localStorage.getItem(AUTH_WORKSPACE_KEY);

      try {
        if (storedUser) {
          const restoredWorkspace = isWorkspace(storedWorkspace)
            ? workspaceFromUser(storedUser, storedWorkspace)
            : workspaceFromUser(storedUser);

          setUser(storedUser);
          setActiveWorkspace(restoredWorkspace);
        }

        const allUsers = await api.getUsers();
        setUsers(allUsers);

        if (storedUser) {
          const refreshedUser = allUsers.find((item) => item.id === storedUser.id);
          if (refreshedUser) {
            setUser(refreshedUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(refreshedUser));
          } else {
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem(AUTH_WORKSPACE_KEY);
            setUser(null);
            setActiveWorkspace('global');
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const persistSession = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser));

    const initialWorkspace = workspaceFromUser(loggedUser);
    setActiveWorkspace(initialWorkspace);
    localStorage.setItem(AUTH_WORKSPACE_KEY, initialWorkspace);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await api.login(email, password);
      persistSession(loggedUser);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await api.login(email, password);
      persistSession(loggedUser);
    } catch (err: any) {
      setError(err.message || 'Switching user failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveWorkspace('global');
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_WORKSPACE_KEY);
  };

  const handleSetActiveWorkspace = (w: Workspace) => {
    setActiveWorkspace(w);
    localStorage.setItem(AUTH_WORKSPACE_KEY, w);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        error,
        activeWorkspace,
        setActiveWorkspace: handleSetActiveWorkspace,
        login,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
