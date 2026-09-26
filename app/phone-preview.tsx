"use client";

import { useState } from "react";
import { ArrowRight, Check, Clock3, Scissors } from "lucide-react";

const services = [{ name: "Signature cut", duration: "45 min", price: "R 350" }, { name: "Wash & style", duration: "60 min", price: "R 420" }, { name: "Colour consult", duration: "30 min", price: "R 180" }];
const days = ["28", "29", "30", "01", "02"];
const times = ["10:30", "11:45", "14:00"];

export function PhonePreview() {
    const [service, setService] = useState(0);
    const [day, setDay] = useState(1);
    const [time, setTime] = useState(0);
    const [confirmed, setConfirmed] = useState(false);

    return <div className="market-phone-stage" aria-label="Interactive preview of a Smallbean booking page"><div className="market-phone-device"><div className="market-phone-screen">
        <div className="market-phone-status"><span>9:41</span><span className="market-phone-signal"><i /><i /><i /><b /></span></div><div className="market-phone-notch" />
        <div className="market-phone-top"><span className="market-phone-brand"><i>s</i>smallbean</span><span className="market-phone-share">•••</span></div>
        {confirmed ? <div className="market-phone-confirmation" aria-live="polite"><span className="market-phone-confirm-icon"><Check size={21} /></span><span className="market-phone-kicker">YOU’RE ON THE BOOKS</span><strong>See you soon.</strong><p>Your {services[service].name.toLowerCase()} is held for {times[time]}.</p><button type="button" onClick={() => setConfirmed(false)}>Choose another time <ArrowRight size={13} /></button></div> : <>
            <div className="market-phone-business"><span className="market-phone-avatar"><Scissors size={17} /></span><div><strong>Studio Moya</strong><small>Hair studio · Johannesburg</small></div><span className="market-phone-live">OPEN</span></div>
            <div className="market-phone-content"><span className="market-phone-kicker">BOOK A VISIT</span><h2>A good hair day<br />starts right here.</h2><p className="market-phone-intro">Choose your service and a time that works for you.</p>
                <div className="market-phone-step"><span>01</span><strong>Choose a service</strong></div><div className="market-phone-services">{services.map((item, index) => <button type="button" aria-pressed={service === index} className={service === index ? "is-selected" : ""} key={item.name} onClick={() => setService(index)}><span className="market-phone-radio">{service === index && <i />}</span><span className="market-phone-service-name"><strong>{item.name}</strong><small>{item.duration}</small></span><b>{item.price}</b></button>)}</div>
                <div className="market-phone-step market-phone-date-step"><span>02</span><strong>Pick a day</strong><small>SAMPLE WEEK</small></div><div className="market-phone-days">{days.map((item, index) => <button type="button" key={`${item}-${index}`} aria-pressed={day === index} className={day === index ? "is-selected" : ""} onClick={() => setDay(index)}><small>{["MON", "TUE", "WED", "THU", "FRI"][index]}</small><strong>{item}</strong></button>)}</div>
                <div className="market-phone-step market-phone-time-step"><span>03</span><strong>Choose a time</strong></div><div className="market-phone-times">{times.map((item, index) => <button type="button" key={item} aria-pressed={time === index} className={time === index ? "is-selected" : ""} onClick={() => setTime(index)}><Clock3 size={10} />{item}</button>)}</div>
                <button type="button" className="market-phone-submit" onClick={() => setConfirmed(true)}>Confirm booking <ArrowRight size={13} /></button><div className="market-phone-powered">A little more time for you. <b>smallbean.</b></div>
            </div>
        </>}
    </div></div></div>;
}