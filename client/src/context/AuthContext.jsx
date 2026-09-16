import { createContext, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);
const USER_KEY = 'edu_user';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(getToken()) && !readStoredUser());

  // If a token exists but we have no user info yet, restore it from /me.
  useEffect(() => {
    if (getToken() && !readStoredUser()) {
      api
        .get('/api/auth/me')
        .then((d) => {
          const u = d.user;
          localStorage.setItem(USER_KEY, JSON.stringify(u));
          setUser(u);
        })
        .catch(() => {
          clearToken();
          localStorage.removeItem(USER_KEY);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistUser = (data) => {
    const u = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      institutionId: data.user.institutionId,
    };
    setToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    return persistUser(data);
  };

  const register = async (payload) => {
    const data = await api.post('/api/auth/register', payload);
    return persistUser(data);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);