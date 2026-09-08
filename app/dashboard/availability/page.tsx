"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Hour = { weekday: number; startMinutes: number; endMinutes: number; enabled: boolean };
const time = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const minutes = (value: string) => { const [hours, mins] = value.split(":").map(Number); return hours * 60 + mins; };

export default function AvailabilityPage() {
    const [hours, setHours] = useState<Hour[]>([]); const [message, setMessage] = useState(""); const [error, setError] = useState("");
    useEffect(() => { void fetch("/api/availability/settings").then(async (response) => { const result = await response.json(); if (response.ok) setHours(result.hours); else setError(result.error); }); }, []);
    function update(index: number, key: keyof Hour, value: string | boolean) { setHours((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: typeof value === "string" ? minutes(value) : value } : item)); }
    async function save(event: FormEvent) { event.preventDefault(); setError(""); setMessage(""); const response = await fetch("/api/availability/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hours }) }); const result = await response.json(); if (!response.ok) setError(result.error); else setMessage("Availability saved."); }
    return <main className="main"><div className="dash-head"><div><Link className="mono" href="/dashboard"><ArrowLeft size={13} /> Overview</Link><h1>Availability</h1></div></div><form className="panel availability-form" onSubmit={save}><p className="form-help">Customers will only see appointment times inside these hours.</p>{hours.map((item, index) => <div className="hours-row" key={item.weekday}><label className="day-toggle"><input type="checkbox" checked={item.enabled} onChange={(event) => update(index, "enabled", event.target.checked)} />{days[item.weekday]}</label><input type="time" value={time(item.startMinutes)} disabled={!item.enabled} onChange={(event) => update(index, "startMinutes", event.target.value)} /><span>to</span><input type="time" value={time(item.endMinutes)} disabled={!item.enabled} onChange={(event) => update(index, "endMinutes", event.target.value)} /></div>)}{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="button dark" type="submit"><Save size={15} /> Save availability</button></form></main>;
}