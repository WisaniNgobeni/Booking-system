import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock3, MapPin, Scissors, ShieldCheck, Star } from "lucide-react";
import { business, services } from "../lib/demo-data";

const highlights = [
    { title: "Premium grooming", text: "Sharp fades, beard detailing, and colour work with a refined finish." },
    { title: "Easy booking", text: "Choose a service, pick a slot and confirm in under a minute." },
    { title: "Trusted service", text: "Top-rated barbering with a calm, professional client experience." },
];

const reviews = [
    { name: "Kuvonakala M", text: "The second appointment by Precious and I’d definitely recommend it for everyone who wants a haircut." },
    { name: "Sibusiso M.", text: "Excellent service. Very neat and every detail feels premium." },
    { name: "Gerald", text: "World-class experience from the moment I walked in to the final finish." },
];

export default function Home() {
    return (
        <main className="barber-app">
            <header className="topbar barber-topbar">
                <Link className="brand" href="/">PRECIOUS<span> BARBER</span></Link>
                <nav className="nav">
                    <a href="#services">Services</a>
                    <a href="#about">About</a>
                    <a href="#reviews">Reviews</a>
                    <a href="#contact">Contact</a>
                </nav>
                <div className="actions">
                    <Link className="button light" href="/auth">Log in</Link>
                    <Link className="button dark" href="/book/studio-moya">Book now <ArrowRight size={15} /></Link>
                </div>
            </header>

            <section className="hero barber-hero">
                <div className="hero-copy">
                    <p className="mono eyebrow">Premium barbering, easy booking</p>
                    <h1>Fresh cuts. Clean lines. Confident energy.</h1>
                    <p>{business.tagline}</p>
                    <div className="actions">
                        <Link className="button dark" href="/book/studio-moya">Book your appointment <ArrowRight size={15} /></Link>
                        <a className="button light" href="#services">Explore services</a>
                    </div>
                    <div className="hero-specs">
                        <div>
                            <strong>4.99</strong>
                            <span>average rating</span>
                        </div>
                        <div>
                            <strong>179</strong>
                            <span>happy reviews</span>
                        </div>
                        <div>
                            <strong>7 days</strong>
                            <span>weekly schedule</span>
                        </div>
                    </div>
                </div>

                <div className="hero-card">
                    <div className="hero-card-top">
                        <span className="mono">Open this week</span>
                        <span className="status-pill">Available</span>
                    </div>
                    <h2>{business.name}</h2>
                    <div className="mini-row">
                        <span><Clock3 size={14} /> {business.hours}</span>
                    </div>
                    <div className="mini-row">
                        <span><MapPin size={14} /> {business.address}</span>
                    </div>
                    <div className="mini-row accent-row">
                        <span>Popular service</span>
                        <strong>Adults Haircut + Beard + Hair Fiber</strong>
                        <small>R230 · 40 mins</small>
                    </div>
                </div>
            </section>

            <div className="trust-strip">
                <span>Men’s grooming</span>
                <span>Beard shaping</span>
                <span>Hair colouring</span>
                <span>Luxury finish</span>
                <span>Top-rated studio</span>
            </div>

            <section className="section" id="services">
                <div className="section-head">
                    <div>
                        <p className="mono eyebrow">Our services</p>
                        <h2>Barbering built around your style.</h2>
                    </div>
                    <Link className="button light" href="/book/studio-moya">Book a session</Link>
                </div>

                <div className="cards service-cards">
                    {services.map((service) => (
                        <article className="feature service-card" key={service.name}>
                            <div className="card-icon"><Scissors size={18} /></div>
                            <h3>{service.name}</h3>
                            <p>{service.detail}</p>
                            <div className="price-row">
                                <strong>{service.price}</strong>
                                <span>{service.duration}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section feature-panel" id="about">
                <div className="section-head split-head">
                    <div>
                        <p className="mono eyebrow">Why clients return</p>
                        <h2>A professional finish without the fuss.</h2>
                    </div>
                </div>

                <div className="cards highlight-cards">
                    {highlights.map((item) => (
                        <article className="feature lift-card" key={item.title}>
                            <div className="card-icon warm"><ShieldCheck size={18} /></div>
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section" id="reviews">
                <div className="section-head">
                    <div>
                        <p className="mono eyebrow">Clients love us</p>
                        <h2>Real experiences. Real results.</h2>
                    </div>
                    <div className="rating-badge">
                        <Star size={15} fill="currentColor" /> 4.99 / 5
                    </div>
                </div>

                <div className="cards review-cards">
                    {reviews.map((review) => (
                        <article className="feature review-card" key={review.name}>
                            <div className="stars">★★★★★</div>
                            <p>“{review.text}”</p>
                            <strong>{review.name}</strong>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section contact-panel" id="contact">
                <div className="contact-copy">
                    <p className="mono eyebrow">Visit the studio</p>
                    <h2>Sharp style, expert care, and a calm experience.</h2>
                    <div className="contact-list">
                        <div><MapPin size={16} /> {business.address}</div>
                        <div><CalendarCheck2 size={16} /> {business.hours}</div>
                        <div><a href={`tel:${business.phone.replace(/\s+/g, "")}`}>{business.phone}</a></div>
                    </div>
                </div>
                <div className="contact-card">
                    <p className="mono">Need a quick refresh?</p>
                    <h3>Book a slot online in minutes.</h3>
                    <Link className="button dark" href="/book/studio-moya">Schedule now <ArrowRight size={15} /></Link>
                </div>
            </section>

            <footer className="footer">
                <span className="brand">PRECIOUS<span> BARBER</span></span>
                <span className="muted">Premium grooming for everyday confidence.</span>
            </footer>
        </main>
    );
}