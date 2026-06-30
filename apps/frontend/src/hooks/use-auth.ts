"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("bp_token");
    const storedUser = localStorage.getItem("bp_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((accessToken: string, authUser: AuthUser) => {
    localStorage.setItem("bp_token", accessToken);
    localStorage.setItem("bp_user", JSON.stringify(authUser));
    setToken(accessToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bp_token");
    localStorage.removeItem("bp_user");
    document.cookie = "bp_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  return { user, token, loading, login, logout, isAuthenticated: !!token };
}
