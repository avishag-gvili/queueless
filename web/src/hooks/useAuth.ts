import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getToken, setToken, clearToken } from "@/lib/auth";
import type { User, LoginRequest, RegisterRequest, Token } from "@/types/api";

const ME_KEY = ["auth", "me"] as const;

async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export function useAuth() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    enabled: !!getToken(),
    retry: false,
  });

  const login = useCallback(
    async (payload: LoginRequest) => {
      const { data } = await api.post<Token>("/auth/login", payload);
      setToken(data.access_token);
      await qc.invalidateQueries({ queryKey: ME_KEY });
      await qc.fetchQuery({ queryKey: ME_KEY, queryFn: fetchMe });
    },
    [qc],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      await api.post<User>("/auth/register", payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearToken();
    qc.clear();
    navigate("/", { replace: true });
  }, [qc, navigate]);

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: !!getToken() && isLoading,
    login,
    register,
    logout,
  };
}
