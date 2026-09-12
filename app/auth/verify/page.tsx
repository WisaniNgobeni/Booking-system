"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function VerifyPage() {
    const [message, setMessage] = useState("Verifying your email...");
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (!token) { setMessage("This verification link is invalid or expired."); return; }
        void fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(async (response) => { const result = await response.json(); setMessage(response.ok ? "Your email has been verified." : result.error); });
    }, []);
    return <main className="success"><div className="mono eyebrow">Email verification</div><h1>{message}</h1><Link className="button dark" href="/dashboard">Continue to dashboard <ArrowRight size={15} /></Link></main>;
}
