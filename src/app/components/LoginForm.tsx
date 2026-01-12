import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import logo from "../../assets/logo.png";
import { supabase } from "../../lib/supabaseClient";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  open: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "signup" | "forgot";

export function LoginForm({ onLogin, open, onClose }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState(""); // digits only

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setPhone("");
    setErrorMsg(null);
    setLoading(false);
    setMode("login");
  };

  const handleSendRecoveryEmail = async () => {
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Email is required.");
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth/recovery`,
    });

    setErrorMsg("If an account exists for that email, a recovery link has been sent.");

    if (error) {
      console.error(error.message);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // ===== FORGOT PASSWORD =====
    if (mode === "forgot") {
      await handleSendRecoveryEmail();
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      try {
        await onLogin(email.trim(), password);
        setEmail("");
        setPassword("");
        setUsername("");
        setPhone("");
        setErrorMsg(null);
        setLoading(false);
        onClose();
      } catch (_err) {
        setErrorMsg("Login failed.");
        setLoading(false);
      }
      return;
    }

    if (!username.trim()) {
      setErrorMsg("Username is required.");
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    const { data, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (authError || !data.user) {
      setErrorMsg(authError?.message ?? "Signup failed.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: cleanEmail,
        username: cleanUsername,
        phone: cleanPhone ? cleanPhone : null,
        points: 0,
        coins: 0,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setErrorMsg(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setMode("login");
    setPassword("");
    setErrorMsg("Account created! Please sign in.");
  };

  const titleDesc =
    mode === "signup"
      ? "Create an account to start playing"
      : mode === "forgot"
      ? "Recover your account via email"
      : "Sign in to your account";

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="PokinPokin Logo" className="w-24 h-24 rounded-full" />
          </div>
          <DialogTitle className="text-2xl">PokinPokin</DialogTitle>
          <DialogDescription>{titleDesc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}

          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Phone (digits only)</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="2498724158"
                />
              </div>
            </>
          )}

          {errorMsg && (
            <p
              className={`text-sm ${
                errorMsg.includes("Account created") || errorMsg.includes("recovery link has been sent")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {errorMsg}
            </p>
          )}

          {mode === "forgot" ? (
            <>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : "Send recovery email"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg(null);
                  }}
                  className="text-sm text-muted-foreground"
                >
                  Back to sign in
                </button>
              </div>
            </>
          ) : (
            <>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Sign In"}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrorMsg(null);
                    setPassword("");
                  }}
                  className="text-sm text-muted-foreground underline"
                >
                  Forgot password?
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signup" ? "login" : "signup");
                    setErrorMsg(null);
                  }}
                  className="text-sm text-muted-foreground"
                >
                  {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
