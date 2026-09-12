"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
    const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [done, setDone] = useState(false);
    async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const token = new URLSearchParams(window.location.search).get("token"); const data = new FormData(event.currentTarget); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: data.get("password") }) }); const result = await response.json(); if (!response.ok) setError(result.error); else { setDone(true); setMessage("Your password has been reset. You can sign in now."); } }
    return <main className="success"><div className="mono eyebrow">Password recovery</div>{done ? <><h1>{message}</h1><Link className="button dark" href="/auth">Sign in <ArrowRight size={15} /></Link></> : <form className="auth-form" onSubmit={submit}><h1>Choose a new password.</h1><input name="password" type="password" minLength={8} placeholder="New password (8+ characters)" required />{error && <p className="form-error">{error}</p>}<button className="button dark confirm">Reset password <ArrowRight size={15} /></button></form>}</main>;
}
