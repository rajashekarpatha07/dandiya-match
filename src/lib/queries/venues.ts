"use client";

import { useQuery } from "@tanstack/react-query";
import { todayIST } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries/keys";
import type { Venue, VenueEvent, VenueWithStats } from "@/lib/types";

type NestedListing = { id: string; status: string };
type NestedEvent = VenueEvent & { partner_listings?: NestedListing[] | null };

export function useVenues() {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.venues,
    queryFn: async () => {
      const today = todayIST();
      const { data, error } = await supabase
        .from("venues")
        .select(
          `
          *,
          venue_events (
            id,
            event_date,
            start_time,
            end_time,
            venue_id,
            partner_listings (id, status)
          )
        `,
        )
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      return ((data ?? []) as Array<Venue & { venue_events: NestedEvent[] | null }>).map(
        (v) => {
          const upcoming = (v.venue_events ?? [])
            .filter((e) => e.event_date >= today)
            .sort((a, b) => a.event_date.localeCompare(b.event_date));
          const next = upcoming[0] ?? null;
          const openListingCount =
            next?.partner_listings?.filter((l) => l.status === "open").length ??
            0;
          const { venue_events: _events, ...venue } = v;
          return {
            ...venue,
            nextEvent: next
              ? {
                  id: next.id,
                  venue_id: next.venue_id,
                  event_date: next.event_date,
                  start_time: next.start_time,
                  end_time: next.end_time,
                }
              : null,
            openListingCount,
          } satisfies VenueWithStats;
        },
      );
    },
  });
}

export function useVenue(venueId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.venue(venueId),
    enabled: Boolean(venueId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", venueId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Venue | null;
    },
  });
}

export function useVenueEvents(venueId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.venueEvents(venueId),
    enabled: Boolean(venueId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_events")
        .select("*")
        .eq("venue_id", venueId)
        .gte("event_date", todayIST())
        .order("event_date");
      if (error) throw error;
      return (data ?? []) as VenueEvent[];
    },
  });
}

export function useEvent(eventId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.event(eventId),
    enabled: Boolean(eventId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_events")
        .select("*, venue:venues(*)")
        .eq("id", eventId)
        .maybeSingle();
      if (error) throw error;
      return data as (VenueEvent & { venue: Venue | null }) | null;
    },
  });
}
