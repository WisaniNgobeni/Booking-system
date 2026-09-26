import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "../marketing-chrome";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
    title: "Booking software pricing",
    description: "Compare Smallbean Free, Pro, and Business plans for service businesses. Start with online bookings at no monthly subscription cost.",
    path: "/pricing",
});
const plans = [
    { name: "Free", price: "0", description: "The essentials to put your booking page to work.", featured: false, features: ["Public business booking page", "Services, prices, and durations", "Availability and time-off settings", "Customer and appointment management"] },
    { name: "Pro", price: "299", description: "More clarity for a business finding its rhythm.", featured: true, features: ["Everything in Free", "Business analytics", "Calendar tools", "A clearer view of your bookings"] },
    { name: "Business", price: "599", description: "More room for a business with a growing team.", featured: false, features: ["Everything in Pro", "Team capabilities", "Staff and service assignments", "Tools for a shared schedule"] },
];
const pricingQuestions = [
    { question: "Can I start without paying?", answer: "Yes. The Free plan includes the core booking page and business management tools, with no monthly subscription price." },
    { question: "Can I change plans later?", answer: "Yes. You can choose a different plan from Business Profile in your dashboard as your needs change." },
    { question: "What currency are these prices in?", answer: "Prices are shown in South African rand (ZAR) per month." },
    { question: "Can customers pay for appointments through the booking page?", answer: "Online payments for customer appointments are not currently part of the booking flow. The paid plans shown here are Smallbean subscriptions." },
];

export default function PricingPage() {
    return <><MarketingHeader active="/pricing" /><main className="market-page">
        <section className="market-pricing-hero"><p className="market-eyebrow market-eyebrow-dark">Good tools. Clear numbers.</p><h1>A plan for your<br /><em>next kind of busy.</em></h1><p>Start with what you need today. Add the tools that help when your business is ready for them.</p></section>
        <section className="market-plans-grid" aria-label="Smallbean subscription plans">{plans.map((plan) => <article className={`market-plan ${plan.featured ? "market-plan-featured" : ""}`} key={plan.name}>{plan.featured && <span className="market-plan-badge">MOST POPULAR</span>}<p className="market-plan-name">{plan.name}</p><p className="market-plan-description">{plan.description}</p><div className="market-plan-price"><span>R</span>{plan.price}<small>/ month</small></div><Link className={`market-plan-action ${plan.featured ? "market-plan-action-featured" : ""}`} href="/auth">{plan.name === "Free" ? "Start for free" : "Create account to upgrade"} <ArrowRight size={15} /></Link><div className="market-plan-divider" /><p className="market-plan-includes">WHAT’S INCLUDED</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul></article>)}</section>
        <p className="market-pricing-footnote">All prices are monthly and shown in ZAR. Paid plans are Smallbean subscriptions; online payments for customer appointments are not included in the current booking flow.</p>
        <section className="market-pricing-compare"><div><p className="market-eyebrow market-eyebrow-dark">Pick at your own pace</p><h2>The booking essentials are there from day one.</h2></div><div className="market-compare-rows"><div><span>Booking page and services</span><b>All plans</b></div><div><span>Availability, hours, and time off</span><b>All plans</b></div><div><span>Analytics and calendar tools</span><b>Pro and Business</b></div><div><span>Team capabilities</span><b>Business</b></div></div></section>
        <section className="market-pricing-faq"><div><p className="market-eyebrow market-eyebrow-dark">Good to know</p><h2>A few notes before you choose.</h2></div><div>{pricingQuestions.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></section>
        <section className="market-pricing-last"><h2>Start with the page.<br /><em>See where it takes you.</em></h2><Link className="market-button market-button-lime" href="/auth">Create a free account <ArrowRight size={15} /></Link></section>
    </main><MarketingFooter /></>;
}