import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

const links = [{ href: "/features", label: "Features" }, { href: "/how-it-works", label: "How it works" }, { href: "/pricing", label: "Pricing" }];

export function MarketingHeader({ dark = false, active }: { dark?: boolean; active?: string }) {
    return <header className={`market-header ${dark ? "market-header-dark" : ""}`}><div className="market-header-inner">
        <Link className="market-brand" href="/" aria-label="Smallbean home"><span className="market-brand-mark">s</span>smallbean<span className="market-brand-period">.</span></Link>
        <nav className="market-nav" aria-label="Main navigation">{links.map((item) => <Link href={item.href} key={item.href} aria-current={active === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>
        <div className="market-header-actions"><Link className="market-signin" href="/auth">Sign in</Link><Link className="market-header-cta" href="/auth">Get started <ArrowRight size={14} /></Link></div>
        <details className="market-mobile-nav"><summary aria-label="Open navigation"><Menu size={21} /><span>Menu</span></summary><nav aria-label="Mobile navigation">{links.map((item) => <Link href={item.href} key={item.href} aria-current={active === item.href ? "page" : undefined}>{item.label}</Link>)}<Link href="/auth">Sign in</Link><Link href="/auth">Create account <ArrowRight size={14} /></Link></nav></details>
    </div></header>;
}

export function MarketingFooter() {
    return <footer className="market-footer"><div className="market-footer-main"><Link className="market-brand" href="/" aria-label="Smallbean home"><span className="market-brand-mark">s</span>smallbean<span className="market-brand-period">.</span></Link><p>More time for the work you love.</p><Link className="market-footer-cta" href="/auth">Make your booking page <ArrowRight size={15} /></Link></div><div className="market-footer-bottom"><span>© {new Date().getFullYear()} Smallbean</span><nav aria-label="Footer navigation"><Link href="/features">Features</Link><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-and-conditions">Terms</Link><Link href="/refund-and-cancellation">Cancellations</Link></nav></div></footer>;
}