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

export function LoginForm({ onLogin, open, onClose }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignUp, setIsSignUp] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setLoading(true);

    // ===== LOGIN =====
    if (!isSignUp) {
      try {
        await onLogin(email.trim(), password);
        reset();
        onClose();
      } catch (err) {
        setErrorMsg("Login failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ===== SIGN UP =====
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

    // ⭐ 核心：profiles 作为业务数据源
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
    setIsSignUp(false);
    setPassword("");
    setErrorMsg("Account created! Please sign in.");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="PokinPokin Logo" className="w-24 h-24 rounded-full" />
          </div>
          <DialogTitle className="text-2xl">PokinPokin</DialogTitle>
          <DialogDescription>
            {isSignUp ? "Create an account to start playing" : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {isSignUp && (
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
            <p className={`text-sm ${errorMsg.includes("Account created") ? "text-green-600" : "text-red-500"}`}>
              {errorMsg}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
              }}
              className="text-sm text-muted-foreground"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
