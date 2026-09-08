import Link from "next/link";
import { ArrowRight, CalendarCheck2, Check, Link2, Share2, Store } from "lucide-react";

const audiences = ["Barbers", "Beauty studios", "Tutors", "Nail artists", "Personal trainers", "Photographers"];
const steps = [
    ["01", "Create your business", "Set up your profile with the details customers need."],
    ["02", "Add services", "Set prices, durations, and the services you offer."],
    ["03", "Set availability", "Choose your opening hours and days off."],
    ["04", "Share your link", "Put your Smallbean link in every social bio."],
];

export default function Home() {
    return <main>
        <header className="topbar platform-topbar">
            <Link className="brand" href="/">smallbean<span>·</span></Link>
            <nav className="nav"><a href="#how-it-works">How it works</a><a href="#businesses">For businesses</a><a href="#customers">For customers</a></nav>
            <div className="actions"><Link className="button light" href="/auth">Sign in</Link><Link className="button dark" href="/auth">Get started <ArrowRight size={15} /></Link></div>
        </header>

        <section className="hero platform-hero">
            <div className="hero-copy"><p className="mono eyebrow">The booking link for your business</p><h1>Bookings that move your business forward.</h1><p>Smallbean gives service businesses a simple booking page customers can use anytime, from Instagram to WhatsApp.</p><div className="actions"><Link className="button dark" href="/auth">Create your business <ArrowRight size={15} /></Link><a className="button light" href="#how-it-works">See how it works</a></div><div className="hero-specs"><div><strong>1 link</strong><span>for every channel</span></div><div><strong>24/7</strong><span>customer bookings</span></div><div><strong>0 fuss</strong><span>to get started</span></div></div></div>
            <div className="hero-card platform-card"><div className="hero-card-top"><span className="mono">Your booking home</span><span className="status-pill"><Check size={12} /> Live</span></div><div className="mock-link"><Link2 size={15} /><span>smallbean.co.za/your-business</span></div><div className="mock-flow"><div><Store size={17} /><span>Your business profile</span></div><div><CalendarCheck2 size={17} /><span>Services and availability</span></div><div><Share2 size={17} /><span>One link to share everywhere</span></div></div><div className="accent-row"><span className="mono">Customers see</span><strong>Your business. Your services. Your availability.</strong></div></div>
        </section>

        <section className="trust-strip" id="businesses">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</section>

        <section className="section" id="how-it-works"><div className="section-head"><div><p className="mono eyebrow">A calmer way to get booked</p><h2>From first setup to confirmed appointment.</h2></div></div><div className="cards highlight-cards">{steps.map(([number, title, text]) => <article className="feature lift-card" key={number}><span className="mono">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

        <section className="section feature-panel" id="customers"><div className="section-head split-head"><div><p className="mono eyebrow">Built for real-world sharing</p><h2>Your customers already know where to find you.</h2></div><p className="section-note">Keep your marketing on Instagram, TikTok, Facebook, or WhatsApp. Smallbean gives every business a focused place to turn attention into appointments.</p></div><div className="platform-grid"><div><Store size={20} /><h3>For every kind of service</h3><p>From a solo tutor to a growing wellness studio, each business gets its own profile and booking link.</p></div><div><CalendarCheck2 size={20} /><h3>Availability that stays honest</h3><p>Slots use your hours, service duration, time off, and existing bookings so customers only see real availability.</p></div><div><Share2 size={20} /><h3>One link, everywhere</h3><p>Share a single link in your bio, messages, and posts. Customers go straight from interest to booking.</p></div></div></section>

        <section className="section cta-band"><p className="mono eyebrow">Ready when you are</p><h2>Give your business a better way to be booked.</h2><Link className="button dark" href="/auth">Create your Smallbean account <ArrowRight size={15} /></Link></section>
        <footer className="footer"><span className="brand">smallbean<span>·</span></span><span className="muted">Booking infrastructure for independent businesses.</span></footer>
    </main>;
}