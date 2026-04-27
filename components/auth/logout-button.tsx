"use client";

import { supabase } from "@/lib/supabase/client";

export function LogoutButton() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-2xl border px-5 py-3 text-center font-semibold"
    >
      Cerrar sesión
    </button>
  );
}