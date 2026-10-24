import { useApi } from "@/lib/axios";
import { User } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAuthCallback = () => {
  const { apiWithAuth } = useApi();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiWithAuth<{ user: User }>({
        method: "POST",
        url: "/auth/callback",
      });
      return data.user;
    },
    retry: 2,
  });
};

export const useCurrentUser = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await apiWithAuth<{ user: User }>({ method: "GET", url: "/auth/me" });
      return data.user;
    },
  });
};
