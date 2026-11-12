// Customer chat over the token-gated Supabase functions.
//
// The conversations/messages tables must NEVER be read or written directly
// from customer-facing code: the anon key can read them, which is how the
// customer data leaked. Customers only ever call these three SECURITY
// DEFINER functions, and each one checks the per-conversation access token,
// so a customer can use only their own chat. The token lives in this
// browser's localStorage only — it is never a secret baked into the code.
//
// The admin portal does not use this file: the signed-in admin reads the
// tables directly through the authenticated role.

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface ChatMessage {
  id: string;
  sender: "customer" | "admin";
  content: string;
  created_at: string;
}

export interface ChatSession {
  conversationId: string;
  accessToken: string;
  paymentMethod: string;
  greeting: string;
}

const SESSION_KEY = "ek_chat_session";

export function saveChatSession(session: ChatSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage full or blocked — the in-memory session still works for this visit.
  }
}

export function loadChatSession(): ChatSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatSession;
    if (!parsed.conversationId || !parsed.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearChatSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore.
  }
}

/** Start a conversation for this customer. Returns the id + access token. */
export async function createChatConversation(input: {
  customerName: string | null;
  customerEmail: string | null;
  paymentMethod: string;
  bookingDetails: Json;
}): Promise<{ id: string; accessToken: string }> {
  const { data, error } = await supabase.rpc("create_conversation", {
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_payment_method: input.paymentMethod,
    p_booking_details: input.bookingDetails,
  });
  if (error || !data || data.length === 0) {
    throw new Error(error?.message ?? "Could not start chat. Please try again.");
  }
  return { id: data[0].id, accessToken: data[0].access_token };
}

/** Read this customer's messages. Throws on a bad token. */
export async function fetchChatMessages(
  conversationId: string,
  accessToken: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase.rpc("get_conversation_messages", {
    p_conversation_id: conversationId,
    p_token: accessToken,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((m) => ({
    id: m.id,
    sender: m.sender === "admin" ? "admin" : "customer",
    content: m.content,
    created_at: m.created_at,
  }));
}

/** Send a message as this customer. */
export async function sendChatMessage(
  conversationId: string,
  accessToken: string,
  content: string,
): Promise<void> {
  const { error } = await supabase.rpc("send_customer_message", {
    p_conversation_id: conversationId,
    p_token: accessToken,
    p_content: content,
  });
  if (error) throw new Error(error.message);
}
