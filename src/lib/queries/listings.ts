"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries/keys";
import type {
  ListingWithProfile,
  PartnerListing,
  PreferredGender,
} from "@/lib/types";
import { useCurrentUser } from "@/lib/queries/profile";

export function useEventListings(eventId: string) {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.listings(eventId),
    enabled: Boolean(eventId && user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_listings")
        .select(
          "*, profile:profiles(id, display_name, avatar_url, age, gender, experience, bio)",
        )
        .eq("event_id", eventId)
        .eq("status", "open")
        .neq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ListingWithProfile[];
    },
  });
}

export function useMyListing(eventId: string) {
  const supabase = createClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.myListing(eventId),
    enabled: Boolean(eventId && user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_listings")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as PartnerListing | null;
    },
  });
}

export function useUpsertListing(eventId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (input: {
      note: string;
      preferred_gender: PreferredGender;
    }) => {
      const existing = await supabase
        .from("partner_listings")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (existing.error) throw existing.error;

      if (existing.data) {
        const { error } = await supabase
          .from("partner_listings")
          .update({
            note: input.note || null,
            preferred_gender: input.preferred_gender,
            status: "open",
          })
          .eq("id", existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partner_listings").insert({
          user_id: user!.id,
          event_id: eventId,
          note: input.note || null,
          preferred_gender: input.preferred_gender,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.myListing(eventId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.listings(eventId),
      });
    },
  });
}

export function useUpdateListingStatus(eventId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: "open" | "closed") => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("partner_listings")
        .update({ status })
        .eq("event_id", eventId)
        .eq("user_id", userData.user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.myListing(eventId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.listings(eventId),
      });
    },
  });
}
