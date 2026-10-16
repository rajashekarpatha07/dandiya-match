"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/components/Toast";
import { queryKeys } from "@/lib/queries/keys";
import { useCurrentUser } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/client";

export function RealtimeListener() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
      void queryClient.invalidateQueries({ queryKey: ["my-listing"] });
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pendingReceivedCount,
      });
    };

    const incoming = supabase
      .channel(`match-in-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_requests",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          toast("New partner request", "info");
          invalidate();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => invalidate(),
      )
      .subscribe();

    const outgoing = supabase
      .channel(`match-out-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          const status = (payload.new as { status?: string }).status;
          if (status === "accepted") toast("Your request was accepted", "success");
          if (status === "rejected") toast("Your request was declined", "info");
          if (status === "cancelled") toast("A request was cancelled", "info");
          invalidate();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(incoming);
      void supabase.removeChannel(outgoing);
    };
  }, [user?.id, queryClient, toast]);

  return null;
}
