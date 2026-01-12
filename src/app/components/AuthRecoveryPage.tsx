import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AuthRecoveryPage() {
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      setMsg("Validating recovery link...");

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg("Recovery link invalid or expired. Please request again.");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMsg("Recovery session missing. Please request a new recovery email.");
        return;
      }

      setMsg("");
      setReady(true);
    })();
  }, []);

  async function onReset(e: React.FormEvent) {
    e.preventDefault();

    if (pw.length < 8) return setMsg("Password must be at least 8 characters.");
    if (pw !== pw2) return setMsg("Passwords do not match.");

    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg("Failed to update password. Please request again.");

    setMsg("Password updated. Please sign in again.");
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Reset Password</h1>

        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

        {ready && (
          <form onSubmit={onReset} className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Confirm new password</Label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>

            <Button type="submit" className="w-full">
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
