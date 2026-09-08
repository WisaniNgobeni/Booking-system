import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "../../../../lib/auth";
export async function POST(request: NextRequest) { await destroySession(request.cookies.get("tandem_session")?.value); const response = NextResponse.json({ ok: true }); response.cookies.delete("tandem_session"); return response; }