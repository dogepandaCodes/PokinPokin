import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface SignupFormProps {
  onSuccess?: () => void;
}

function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [username, setUsername] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPhoneDigits = digitsOnly(phone);

    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }
    if (!cleanEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    const phoneE164 = cleanPhoneDigits ? `+1${cleanPhoneDigits}` : undefined;

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      phone: phoneE164,
      options: {
        data: {
          display_name: cleanUsername,
          full_name: cleanUsername,
          name: cleanUsername,

          phone_digits: cleanPhoneDigits,
        },
      },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Signup failed.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Username (Display name)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={loading}
      />

      <input
        type="tel"
        placeholder="Phone (digits only, e.g. 1234567890)"
        value={phone}
        onChange={(e) => setPhone(digitsOnly(e.target.value))}
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={loading}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}

