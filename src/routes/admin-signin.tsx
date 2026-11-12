import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-signin")({
  head: () => ({ meta: [{ title: "Admin sign in | Emirates" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminSignInPage,
});

const ADMIN_USERNAME = "D3LTAD3MON";
// No password lives in this code. The admin types it here and Supabase Auth
// checks it. The admin user (this email) must exist in this project's
// Supabase Authentication — create it in the Supabase dashboard, never in
// code and never in chat.
const ADMIN_EMAIL = "d3ltad3mon@admin.local";

function AdminSignInPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin-portal-x7k9" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (username !== ADMIN_USERNAME) {
        setError("Invalid credentials");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (error) throw error;
      navigate({ to: "/admin-portal-x7k9" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Restricted access. Authorized personnel only.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-md border bg-card p-6">
          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-emirates/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-emirates/40"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emirates py-3 font-semibold text-emirates-foreground transition hover:bg-emirates-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
