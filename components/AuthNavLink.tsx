"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AuthNavLink({ className }: { className?: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <button onClick={handleLogout} className={className}>
        Odjava
      </button>
    );
  }

  return (
    <a href="/login" className={className}>
      Prijava
    </a>
  );
}