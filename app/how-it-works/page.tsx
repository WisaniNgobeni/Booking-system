import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarCheck2, Clock3, Link2, Settings2, UserRound } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "../marketing-chrome";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
    title: "How online booking works",
    description: "Set up your Smallbean business page, add services and working hours, then share one link so customers can book available appointments.",
    path: "/how-it-works",
});
const steps = [
    { icon: Settings2, number: "01", title: "Tell Smallbean about your business", body: "Add your business name, category, and the details customers should see. Your public page starts to take shape as you go." },
    { icon: CalendarCheck2, number: "02", title: "Put your services on the page", body: "Give each service a clear description, duration, and price. Assign staff where you need them." },
    { icon: Clock3, number: "03", title: "Set the hours that suit your work", body: "Choose when you work, add time away, and set booking notice and advance limits. Availability uses these details when showing slots." },
    { icon: Link2, number: "04", title: "Share your page and take bookings", body: "Copy your business link into your social bio, message it to a customer, or put it on your website. Customers choose their service, time, and contact details." },
];

export default function HowItWorksPage() {
    return <><MarketingHeader active="/how-it-works" /><main className="market-page">
        <section className="market-page-hero market-how-hero"><div className="market-page-hero-copy"><p className="market-eyebrow market-eyebrow-dark">From blank page to booked</p><h1>Set it up once.<br /><em>Let the link work.</em></h1><p>You know your business. Smallbean helps you turn what you offer and when you’re free into a booking page customers can use.</p><Link className="market-button market-button-dark" href="/auth">Start with your business <ArrowRight size={16} /></Link></div><div className="market-how-note"><span className="market-how-note-icon"><UserRound size={19} /></span><p>Made for the person doing the work, whether that’s just you or the whole team.</p><span className="market-small-label">A SETUP THAT GROWS WITH YOU</span></div></section>
        <section className="market-how-steps"><div className="market-how-steps-heading"><p className="market-eyebrow market-eyebrow-dark">Your setup, in four moves</p><h2>Nothing complicated<br />between you and the link.</h2><p>Start with the basics, preview your page, and add detail when you need it.</p></div><div className="market-how-timeline">{steps.map(({ icon: Icon, number, title, body }, index) => <article className="market-how-step" key={number}><div className="market-how-step-rail"><span>{number}</span><i className={index === steps.length - 1 ? "last" : ""} /></div><div className="market-how-step-copy"><span className="market-how-step-icon"><Icon size={18} /></span><div><h3>{title}</h3><p>{body}</p></div></div><ArrowUpRight className="market-how-step-arrow" size={17} /></article>)}</div></section>
        <section className="market-customer-flow"><div className="market-customer-flow-copy"><p className="market-eyebrow">What your customer sees</p><h2>A short path from “I’m interested” to “See you then.”</h2><p>No account to create. No guessing what a service costs. Just a clear flow that respects the schedule you set.</p></div><div className="market-flow-steps"><div><span>01</span><strong>Find your page</strong><small>From a post, profile, or message</small></div><i /><div><span>02</span><strong>Choose a service</strong><small>See the details before booking</small></div><i /><div><span>03</span><strong>Pick a real slot</strong><small>Choose from available times</small></div><i /><div><span>04</span><strong>Share their details</strong><small>Confirm the appointment</small></div></div></section>
        <section className="market-how-last"><div><p className="market-eyebrow market-eyebrow-dark">A good place to begin</p><h2>Make your page yours.<br /><em>Then let people find it.</em></h2></div><Link className="market-button market-button-dark" href="/auth">Create your free account <ArrowRight size={16} /></Link></section>
    </main><MarketingFooter /></>;
}