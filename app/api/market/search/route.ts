import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { market } from "@/lib/market-data/provider";
export async function GET(request: Request) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to search instruments." },
      { status: 401 },
    );
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 80)
    return NextResponse.json({ data: [], error: null });
  const result = await market.search(q);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
