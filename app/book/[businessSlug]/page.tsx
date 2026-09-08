"use client";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Check, Clock3, MapPin } from "lucide-react";
import { business, services } from "../../../lib/demo-data";

const nextDays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        day: date.getDate(),
    };
});

export default function BookingPage({ params }: { params: Promise<{ businessSlug: string }> }) {
    const [selected, setSelected] = useState(0);
    const [date, setDate] = useState(nextDays[0].key);
    const [time, setTime] = useState("");
    const [slots, setSlots] = useState<string[]>([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [businessSlug, setBusinessSlug] = useState("studio-moya");

    useEffect(() => {
        void params.then(({ businessSlug: slug }) => setBusinessSlug(slug));
    }, [params]);

    useEffect(() => {
        const chosen = services[selected];
        const slug = businessSlug || "studio-moya";
        fetch(`/api/availability?businessSlug=${encodeURIComponent(slug)}&service=${encodeURIComponent(chosen.name)}&date=${date}`)
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) {
                    setSlots([]);
                    return;
                }
                setSlots(result.slots ?? []);
                setTime("");
            })
            .catch(() => setSlots([]));
    }, [businessSlug, date, selected]);

    const submit = async (form: HTMLFormElement) => {
        setSubmitting(true);
        setError("");
        const data = new FormData(form);
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessSlug: businessSlug || "studio-moya",
                service: services[selected].name,
                date,
                time,
                name: data.get("name"),
                email: data.get("email"),
                phone: data.get("phone"),
            }),
        });
        const result = await response.json();
        setSubmitting(false);
        if (!response.ok) {
            setError(result.error || "Unable to confirm your booking.");
            return;
        }
        setDone(true);
    };

    return (
        <main className="booking">
            <header className="topbar">
                <span className="brand">{business.name}<span>·</span></span>
                <span className="mono">Book an appointment</span>
            </header>

            <section className="booking-wrap">
                {done ? (
                    <div className="success">
                        <div className="success-icon"><Check size={28} /></div>
                        <div className="mono eyebrow">You’re all set</div>
                        <h1>See you at the studio.</h1>
                        <p>Your appointment request is confirmed. We’ll keep the details ready for your visit.</p>
                        <a className="button dark" href="/">Back to home <ArrowRight size={15} /></a>
                    </div>
                ) : (
                    <>
                        <div className="booking-intro">
                            <div className="mono eyebrow">Welcome to {business.name}</div>
                            <h1>Make time for yourself.</h1>
                            <p>{business.tagline}</p>
                            <div className="location"><MapPin size={15} /> {business.address}</div>
                        </div>

                        <div className="booking-panel">
                            <div className="mono">01 / Choose a service</div>
                            <div className="service-list">
                                {services.map((service, index) => (
                                    <button type="button" onClick={() => setSelected(index)} className={`service ${selected === index ? "chosen" : ""}`} key={service.name}>
                                        <span>
                                            <b>{service.name}</b>
                                            <small>{service.detail}</small>
                                        </span>
                                        <span>
                                            <strong>{service.price}</strong>
                                            <small><Clock3 size={13} /> {service.duration}</small>
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mono">02 / Pick a day</div>
                            <div className="date-row">
                                {nextDays.map((day) => (
                                    <button type="button" key={day.key} className={`date ${date === day.key ? "active-date" : ""}`} onClick={() => setDate(day.key)}>
                                        <span>{day.day}</span>
                                        {day.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mono">03 / Pick a time</div>
                            {slots.length === 0 ? (
                                <p className="form-error">No slots available for this day. Please choose another date.</p>
                            ) : (
                                <div className="times">
                                    {slots.map((slot) => (
                                        <button type="button" key={slot} className={time === slot ? "selected-time" : ""} onClick={() => setTime(slot)}>
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submit(event.currentTarget); }}>
                                <div className="customer-fields">
                                    <input name="name" placeholder="Full name" required />
                                    <input name="email" type="email" placeholder="Email address" required />
                                    <input name="phone" type="tel" placeholder="Phone number" required />
                                </div>
                                {error && <p className="form-error" role="alert">{error}</p>}
                                <button className="button dark confirm" type="submit" disabled={submitting || !time}>
                                    {submitting ? "Confirming..." : "Confirm appointment"}
                                    <ArrowRight size={15} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
