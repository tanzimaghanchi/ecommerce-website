import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

const AuthContext = createContext(null);

const SESSION_KEY = "faishora_auth_session";

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const clearSessionStorage = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const savedSession = readSession();

      if (!savedSession?.token) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await axios.get(apiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${savedSession.token}`,
          },
        });

        setToken(savedSession.token);
        setUser(response.data.user);
        persistSession({
          token: savedSession.token,
          user: response.data.user,
        });
      } catch {
        clearSessionStorage();
        setToken("");
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    restoreSession();
  }, []);

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    persistSession({ token: nextToken, user: nextUser });
  };

  const register = async (payload) => {
    const response = await axios.post(apiUrl("/api/auth/register"), payload);
    saveSession(response.data.token, response.data.user);
    return response.data.user;
  };

  const login = async (payload) => {
    const response = await axios.post(apiUrl("/api/auth/login"), payload);
    saveSession(response.data.token, response.data.user);
    return response.data.user;
  };

  const updateProfile = async (payload) => {
    const response = await axios.put(apiUrl("/api/auth/profile"), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    saveSession(token, response.data.user);
    return response.data;
  };

  const logout = () => {
    clearSessionStorage();
    setToken("");
    setUser(null);
  };

  const requestPasswordReset = async (payload) => {
    const response = await axios.post(apiUrl("/api/auth/forgot-password"), payload);
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authReady,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
        register,
        updateProfile,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
