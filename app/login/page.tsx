"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Dinamično določi osnovni URL glede na okolje
  const getURL = () => {
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ?? // Določi v .env ali Vercelu
      process.env.NEXT_PUBLIC_VERCEL_URL ?? // Samodejno dodeli Vercel
      "http://localhost:3000/";

    // Zagotovi https:// in zaključno poševnico
    url = url.startsWith("http") ? url : `https://${url}`;
    url = url.endsWith("/") ? url : `${url}/`;
    return url;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
      },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <h1 className="text-xl font-bold mb-2">Preveri e-pošto 📬</h1>
        <p className="text-slate-500 text-sm">Poslali smo ti povezavo za prijavo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-xl font-bold mb-6 text-center">Prijava</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="ime.priimek@student.fmf.uni-lj.si"
          className="border rounded-md px-3 py-2 text-sm w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium"
        >
          Pošlji povezavo za prijavo
        </button>
      </form>
    </div>
  );
}