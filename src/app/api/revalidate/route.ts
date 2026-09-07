import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  // ponytail: optional shared secret; set REVALIDATE_SECRET and append ?secret= to the Prismic webhook URL. Unset = legacy open behavior.
  const expected = process.env.REVALIDATE_SECRET;
  if (expected && request.nextUrl.searchParams.get("secret") !== expected) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("prismic", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
