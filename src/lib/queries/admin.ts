"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries/keys";
import type { Venue, VenueEvent } from "@/lib/types";

// Check if current user is admin
export function useIsAdmin() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return data as boolean;
    },
  });
}

// Get all venues (including inactive ones) for admin
export function useAdminVenues() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["admin", "venues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Venue[];
    },
  });
}

// Get all events for a venue (for admin)
export function useAdminVenueEvents(venueId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["admin", "venue", venueId, "events"],
    enabled: Boolean(venueId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_events")
        .select("*")
        .eq("venue_id", venueId)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VenueEvent[];
    },
  });
}

// Create venue
export function useCreateVenue() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (venue: Omit<Venue, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("venues")
        .insert(venue)
        .select()
        .single();
      if (error) throw error;
      return data as Venue;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.venues });
    },
  });
}

// Update venue
export function useUpdateVenue() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Venue, "id" | "created_at">>;
    }) => {
      const { data, error } = await supabase
        .from("venues")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Venue;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.venues });
    },
  });
}

// Delete venue
export function useDeleteVenue() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (venueId: string) => {
      const { error } = await supabase.from("venues").delete().eq("id", venueId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.venues });
    },
  });
}

// Create venue event
export function useCreateVenueEvent() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (event: Omit<VenueEvent, "id">) => {
      const { data, error } = await supabase
        .from("venue_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data as VenueEvent;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "venue", data.venue_id, "events"],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.venueEvents(data.venue_id),
      });
    },
  });
}

// Update venue event
export function useUpdateVenueEvent() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      venueId,
      updates,
    }: {
      id: string;
      venueId: string;
      updates: Partial<Omit<VenueEvent, "id" | "venue_id">>;
    }) => {
      const { data, error } = await supabase
        .from("venue_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as VenueEvent;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "venue", data.venue_id, "events"],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.venueEvents(data.venue_id),
      });
    },
  });
}

// Delete venue event
export function useDeleteVenueEvent() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, venueId }: { id: string; venueId: string }) => {
      const { error } = await supabase
        .from("venue_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { venueId };
    },
    onSuccess: ({ venueId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "venue", venueId, "events"],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.venueEvents(venueId),
      });
    },
  });
}
