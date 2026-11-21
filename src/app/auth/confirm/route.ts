
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || type !== "email") {
    return NextResponse.redirect(
      new URL("/login?error=confirmation", request.url)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard", request.url)
  );
}
