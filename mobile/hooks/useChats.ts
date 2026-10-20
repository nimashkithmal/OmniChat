import { useApi } from "@/lib/axios";
import type { Chat } from "@/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ChatResponse = Chat & {
  participants?: Chat["participant"] | Chat["participant"][];
};

const normalizeChat = (chat: ChatResponse): Chat => ({
  ...chat,
  participant:
    chat.participant ??
    (Array.isArray(chat.participants) ? chat.participants[0] : chat.participants) ??
    null,
});

export const useChats = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await apiWithAuth<ChatResponse[] | { chats?: ChatResponse[] }>({
        method: "GET",
        url: "/chats",
      });
      const chats = Array.isArray(data) ? data : data.chats ?? [];
      return chats.map(normalizeChat);
    },
  });
};

export const useGetOrCreateChat = () => {
  const { apiWithAuth } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data } = await apiWithAuth<Chat>({
        method: "POST",
        url: `/chats/with/${participantId}`,
      });
      return normalizeChat(data as ChatResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
