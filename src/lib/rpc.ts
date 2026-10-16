import { createClient } from "@/lib/supabase/client";
import type { MatchRequest } from "@/lib/types";

export async function sendRequest(
  p_event_id: string,
  p_receiver_id: string,
  p_message?: string | null,
) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("send_request", {
    p_event_id,
    p_receiver_id,
    p_message: p_message || null,
  });
  if (error) throw error;
  return data as MatchRequest;
}

export async function respondToRequest(p_request_id: string, p_accept: boolean) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("respond_to_request", {
    p_request_id,
    p_accept,
  });
  if (error) throw error;
  return data as MatchRequest;
}

export async function cancelRequest(p_request_id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("cancel_request", {
    p_request_id,
  });
  if (error) throw error;
  return data as MatchRequest;
}

export async function unmatch(p_request_id: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("unmatch", { p_request_id });
  if (error) throw error;
}
