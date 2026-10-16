"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries/keys";
import type { Block, Profile, ProfileContact, PublicProfile } from "@/lib/types";

export function useCurrentUser() {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });
}

export function useMyProfile() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.profile(user?.id ?? "anon"),
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useMyContacts() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.contacts(user?.id ?? "anon"),
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_contacts")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileContact | null;
    },
  });
}

export function useMatchedContact(otherUserId: string | undefined) {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.contacts(otherUserId ?? "none"),
    enabled: Boolean(otherUserId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_contacts")
        .select("*")
        .eq("user_id", otherUserId!)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileContact | null;
    },
  });
}

export function useBlocks() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.blocks,
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocks")
        .select("*, blocked:profiles!blocked_id(id, display_name, avatar_url)")
        .eq("blocker_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Array<
        Block & { blocked: Pick<PublicProfile, "id" | "display_name" | "avatar_url"> | null }
      >;
    },
  });
}

export function useBlockUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (blockedId: string) => {
      const { error } = await supabase.from("blocks").insert({
        blocker_id: user!.id,
        blocked_id: blockedId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUnblockUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (blockedId: string) => {
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", user!.id)
        .eq("blocked_id", blockedId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useReportUser() {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (input: {
      reportedId: string;
      reason: string;
      eventId?: string | null;
    }) => {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user!.id,
        reported_id: input.reportedId,
        event_id: input.eventId ?? null,
        reason: input.reason,
      });
      if (error) throw error;
    },
  });
}
