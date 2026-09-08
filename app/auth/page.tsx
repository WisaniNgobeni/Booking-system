"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AuthPage() {
    const [mode, setMode] = useState<"signup" | "login">("signup");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setBusy(true); setError("");
        const data = new FormData(event.currentTarget);
        const body = { name: data.get("name"), email: data.get("email"), password: data.get("password") };
        const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const result = await response.json(); setBusy(false);
        if (!response.ok) { setError(result.error); return; }
        window.location.href = "/dashboard";
    }
    return <main><header className="topbar"><Link className="brand" href="/">smallbean<span>·</span></Link><Link className="mono" href="/">Back to home</Link></header><section className="auth-wrap"><div className="auth-copy"><div className="mono eyebrow">Your business, in motion</div><h1>Make more room for the work.</h1><p>One calm place for your bookings, customers and next great day.</p></div><form className="auth-form" onSubmit={submit}><div className="auth-tabs"><button type="button" className={mode === "signup" ? "selected" : ""} onClick={() => setMode("signup")}>Create account</button><button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Sign in</button></div>{mode === "signup" && <input name="name" placeholder="Your name" required />}<input name="email" type="email" placeholder="Email address" required /><input name="password" type="password" placeholder="Password (8+ characters)" minLength={8} required />{error && <p className="form-error" role="alert">{error}</p>}<button className="button dark confirm" disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}<ArrowRight size={15} /></button><small className="legal">By continuing, you agree to Smallbean’s terms and privacy policy.</small></form></section></main>;
}