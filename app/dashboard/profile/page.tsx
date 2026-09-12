"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Save } from "lucide-react";

type Business = { name: string; slug: string; category?: string; description?: string; phone?: string; email?: string };
type Billing = { plan: string; status: string; providerCustomerId?: string } | null;

export default function ProfilePage() {
    const [form, setForm] = useState<Business>({ name: "", slug: "", category: "", description: "", phone: "", email: "" });
    const [billing, setBilling] = useState<Billing>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        void Promise.all([fetch("/api/business/me"), fetch("/api/billing/status")]).then(async ([businessResponse, billingResponse]) => {
            const businessResult = await businessResponse.json();
            if (businessResponse.ok) setForm(businessResult.business); else setError(businessResult.error);
            if (billingResponse.ok) setBilling((await billingResponse.json()).subscription);
        });
    }, []);
    async function save(event: FormEvent) {
        event.preventDefault(); setError(""); setMessage("");
        const response = await fetch("/api/business/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const result = await response.json();
        if (!response.ok) setError(result.error); else { setForm(result.business); setMessage("Business profile saved."); }
    }
    async function billingAction(path: string, body?: object) {
        setBusy(true); setError("");
        const response = await fetch(path, { method: "POST", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
        const result = await response.json(); setBusy(false);
        if (!response.ok) setError(result.error); else if (result.url) window.location.href = result.url;
    }
    return <main className="main">
        <div className="dash-head"><div><Link className="mono" href="/dashboard"><ArrowLeft size={13} /> Overview</Link><h1>Business profile</h1></div></div>
        <section className="panel billing-panel"><div><div className="mono eyebrow">Subscription</div><h2>{billing?.plan || "FREE"} · {billing?.status || "TRIALING"}</h2><p className="form-help">Manage your Smallbean workspace subscription.</p></div><div className="actions">{billing?.providerCustomerId ? <button className="button light" disabled={busy} onClick={() => void billingAction("/api/billing/portal")}><CreditCard size={15} /> Manage billing</button> : <button className="button dark" disabled={busy} onClick={() => void billingAction("/api/billing/checkout", { plan: "PRO" })}><CreditCard size={15} /> Start Pro</button>}</div></section>
        <form className="panel settings-form" onSubmit={save}><p className="form-help">This information appears on your public Smallbean booking page.</p><label>Business name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Booking link<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase() })} required /><small>smallbean.co.za/{form.slug || "your-business"}</small></label><label>Category<input value={form.category || ""} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Beauty, tutoring, wellness" /></label><label>Description<textarea value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} placeholder="Tell customers what your business offers" /></label><div className="form-row"><label>Phone<input value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Email<input type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label></div>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="button dark" type="submit"><Save size={15} /> Save profile</button></form>
    </main>;
}
