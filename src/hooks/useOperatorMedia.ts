import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOperatorMedia } from "@/lib/operator-media.functions";

const MEDIA_KEY = ["operator-media"] as const;

export function useOperatorMedia() {
  const listMedia = useServerFn(listOperatorMedia);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: MEDIA_KEY,
    queryFn: () => listMedia(),
    staleTime: 30_000,
  });

  return {
    media: query.data ?? [],
    loading: query.isLoading,
    refresh: () => queryClient.invalidateQueries({ queryKey: MEDIA_KEY }),
  };
}
