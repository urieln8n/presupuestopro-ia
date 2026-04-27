"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setIsChecking(false);
    }

    checkUser();
  }, []);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-zinc-500">Comprobando sesión...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}