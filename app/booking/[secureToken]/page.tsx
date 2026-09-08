"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

type Booking = { customer?: { name: string; email?: string }; service?: { name: string; durationMinutes: number }; startsAt?: string; status?: string };
export default function BookingManagementPage({ params }: { params: Promise<{ secureToken: string }> }) {
    const [booking, setBooking] = useState<Booking | null>(null); const [error, setError] = useState(""); const [done, setDone] = useState(false);
    useEffect(() => { void params.then(({ secureToken }) => fetch(`/api/booking-management/${secureToken}`).then(async (response) => { const result = await response.json(); if (!response.ok) setError(result.error); else setBooking(result.booking); })); }, [params]);
    async function cancel() { const { secureToken } = await params; const response = await fetch(`/api/booking-management/${secureToken}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "CANCELLED" }) }); if (response.ok) setDone(true); else setError((await response.json()).error); }
    if (error) return <main className="success"><div className="mono eyebrow">Booking unavailable</div><h1>{error}</h1><Link className="button dark" href="/">Back to Smallbean <ArrowRight size={15} /></Link></main>;
    if (!booking) return <main className="success"><div className="mono eyebrow">Loading booking</div><h1>Just a moment.</h1></main>;
    return <main><header className="topbar"><Link className="brand" href="/">smallbean<span>·</span></Link><span className="mono">Manage booking</span></header><section className="manage-wrap">{done ? <div className="success"><div className="success-icon"><Check size={28} /></div><div className="mono eyebrow">Booking cancelled</div><h1>Your appointment has been cancelled.</h1><Link className="button dark" href="/">Back to Smallbean <ArrowRight size={15} /></Link></div> : <><div className="mono eyebrow">Your appointment</div><h1>{booking.service?.name}</h1><p className="manage-detail">{booking.customer?.name} · {booking.startsAt ? new Date(booking.startsAt).toLocaleString() : "Scheduled appointment"}</p><button className="button light" onClick={cancel}><X size={15} /> Cancel appointment</button></>}</section></main>;
}