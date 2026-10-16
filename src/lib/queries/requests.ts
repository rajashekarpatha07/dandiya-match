"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelRequest,
  respondToRequest,
  sendRequest,
  unmatch,
} from "@/lib/rpc";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries/keys";
import type { MatchRequest, RequestWithDetails } from "@/lib/types";
import { useCurrentUser } from "@/lib/queries/profile";

const REQUEST_SELECT =
  "*, sender:profiles!sender_id(id, display_name, avatar_url, age, gender, experience, bio), receiver:profiles!receiver_id(id, display_name, avatar_url, age, gender, experience, bio), event:venue_events(*, venue:venues(*))";

export function useReceivedRequests() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.receivedRequests,
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_requests")
        .select(REQUEST_SELECT)
        .eq("receiver_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RequestWithDetails[];
    },
  });
}

export function useSentRequests() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.sentRequests,
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_requests")
        .select(REQUEST_SELECT)
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RequestWithDetails[];
    },
  });
}

export function useMatchedRequests() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.matchedRequests,
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_requests")
        .select(REQUEST_SELECT)
        .eq("status", "accepted")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RequestWithDetails[];
    },
  });
}

export function useEventSentRequests(eventId: string) {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.eventSentRequests(eventId),
    enabled: Boolean(eventId && user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_requests")
        .select("id, receiver_id, status")
        .eq("sender_id", user!.id)
        .eq("event_id", eventId);
      if (error) throw error;
      return (data ?? []) as Pick<MatchRequest, "id" | "receiver_id" | "status">[];
    },
  });
}

export function usePendingReceivedCount() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.pendingReceivedCount,
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("match_requests")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function invalidateRequestQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["requests"] });
  void queryClient.invalidateQueries({ queryKey: ["listings"] });
  void queryClient.invalidateQueries({ queryKey: ["my-listing"] });
  void queryClient.invalidateQueries({ queryKey: ["contacts"] });
}

export function useSendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      eventId: string;
      receiverId: string;
      message?: string;
    }) => sendRequest(input.eventId, input.receiverId, input.message),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { requestId: string; accept: boolean }) =>
      respondToRequest(input.requestId, input.accept),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => cancelRequest(requestId),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
}

export function useUnmatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => unmatch(requestId),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
}
