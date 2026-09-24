import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Section = { title: string; paragraphs: string[] };

export function PolicyPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Section[] }) {
    return <main className="policy-page"><header className="topbar"><Link className="brand" href="/">smallbean<span>·</span></Link><Link className="button light" href="/"><ArrowLeft size={15} /> Back to home</Link></header><article className="policy-wrap"><p className="mono eyebrow">{eyebrow}</p><h1>{title}</h1><p className="policy-intro">{intro}</p><dl className="policy-dates"><div><dt>Effective date</dt><dd>24 September 2026</dd></div><div><dt>Last updated</dt><dd>24 September 2026</dd></div></dl>{sections.map((section) => <section className="policy-section" key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="policy-contact"><strong>Questions or requests</strong><p>Use the support or contact channel made available through Smallbean Booking System and include the email address linked to your account and any relevant booking or payment reference.</p></div></article><footer className="footer"><span className="brand">smallbean<span>·</span></span><nav className="footer-links" aria-label="Legal information"><Link href="/terms-and-conditions">Terms &amp; Conditions</Link><Link href="/privacy-policy">Privacy Policy</Link><Link href="/refund-and-cancellation">Refund &amp; Cancellation Policy</Link></nav></footer></main>;
}
