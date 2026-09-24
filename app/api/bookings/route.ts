import { NextResponse } from "next/server";
import { createPersistentBooking, validateBooking } from "../../../lib/booking";
import { rateLimit, requestAddress } from "../../../lib/security";

export async function POST(request: Request) {
    const limited = await rateLimit(`booking:${requestAddress(request)}`, 20, 60 * 60_000);
    if (limited) return limited;
    try {
        const booking = await createPersistentBooking(validateBooking(await request.json()));
        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create booking." }, { status: 400 });
    }
}