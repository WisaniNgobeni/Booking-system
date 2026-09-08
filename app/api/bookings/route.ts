import { NextResponse } from "next/server";
import { createPersistentBooking, validateBooking } from "../../../lib/booking";

export async function POST(request: Request) {
    try {
        const booking = await createPersistentBooking(validateBooking(await request.json()));
        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create booking." }, { status: 400 });
    }
}