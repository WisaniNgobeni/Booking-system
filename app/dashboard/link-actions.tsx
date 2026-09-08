"use client";
import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

export default function LinkActions({ slug }: { slug: string }) {
    const [message, setMessage] = useState("");
    const url = typeof window === "undefined" ? `/book/${slug}` : `${window.location.origin}/book/${slug}`;
    async function copy() { await navigator.clipboard.writeText(url); setMessage("Copied"); }
    async function share() { if (navigator.share) await navigator.share({ title: "Book with my business", url }); else await copy(); }
    return <div className="actions"><button className="button light" onClick={() => void copy()}><Copy size={15} /> {message || "Copy link"}</button><button className="button dark" onClick={() => void share()}><Share2 size={15} /> Share</button></div>;
}