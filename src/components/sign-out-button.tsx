
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-full border border-[#253D35]/20 px-5 py-2.5 text-sm font-medium transition hover:bg-[#253D35] hover:text-white"
    >
      Sign out
    </button>
  );
}
