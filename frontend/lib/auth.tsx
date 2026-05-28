"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie, deleteCookie } from "./cookies";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read token and user from sessionStorage (not localStorage for security)
    try {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      const storedUser = sessionStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      // sessionStorage not available or corrupted data
      console.warn("Failed to read auth from sessionStorage:", e);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    // Store in sessionStorage (not localStorage) - sessionStorage is cleared when tab closes
    // Token is also set as HttpOnly cookie by server for SSR
    try {
      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn("Failed to write auth to sessionStorage:", e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn("Failed to clear auth from sessionStorage:", e);
    }
    // Also clear the cookie (server should handle this, but we try anyway)
    deleteCookie("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}