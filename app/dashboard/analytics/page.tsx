"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";

type Report = { days: number; totals: { bookings: number; completed: number; cancellations: number; revenue: number }; topServices: { name: string; count: number }[] };
export default function AnalyticsPage() {
    const [report, setReport] = useState<Report | null>(null); const [days, setDays] = useState(30); const [error, setError] = useState("");
    useEffect(() => { void fetch(`/api/analytics?days=${days}`).then(async (response) => { const result = await response.json(); if (response.ok) setReport(result); else setError(result.error); }); }, [days]);
    return <main className="main"><div className="dash-head"><div><Link className="mono" href="/dashboard"><ArrowLeft size={13} /> Overview</Link><h1>Analytics</h1></div><select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></div>{error && <p className="form-error">{error}</p>}{report && <><div className="stats"><div className="stat"><span className="mono">Bookings</span><strong>{report.totals.bookings}</strong><small>In selected period</small></div><div className="stat"><span className="mono">Completed</span><strong>{report.totals.completed}</strong><small>Completed appointments</small></div><div className="stat"><span className="mono">Cancellations</span><strong>{report.totals.cancellations}</strong><small>Cancelled appointments</small></div><div className="stat"><span className="mono">Revenue</span><strong>R {report.totals.revenue.toFixed(2)}</strong><small>Completed services</small></div></div><section className="panel"><div className="panel-head"><h2>Popular services</h2><TrendingUp size={18} /></div>{report.topServices.length ? report.topServices.map((service) => <div className="mini-row" key={service.name}><b>{service.name}</b><span>{service.count} bookings</span></div>) : <p style={{ color: "var(--muted)" }}>Complete bookings will appear here.</p>}</section></>}</main>;
}
