import Link from "next/link";
import { CalendarDays, ChartNoAxesColumn, Clock3, LayoutDashboard, Settings, Users, Scissors, Plus, ArrowUpRight } from "lucide-react";
import { appointments } from "../../lib/demo-data";

const links = [["Overview", LayoutDashboard], ["Calendar", CalendarDays], ["Appointments", Clock3], ["Customers", Users], ["Services", Scissors], ["Analytics", ChartNoAxesColumn], ["Settings", Settings]] as const;

export default function Dashboard() {
    return (
        <div className="dashboard">
            <aside className="sidebar">
                <Link href="/" className="brand">PRECIOUS<span> BARBER</span></Link>
                {links.map(([label, Icon], index) => (
                    <Link className={`side-link ${index === 0 ? "active" : ""}`} href={index === 1 ? "/book/studio-moya" : "/dashboard"} key={label}>
                        <Icon size={16} />
                        <span>{label}</span>
                    </Link>
                ))}
            </aside>

            <main className="main">
                <div className="dash-head">
                    <div>
                        <div className="mono eyebrow">Wednesday, 26 August 2026</div>
                        <h1>Good morning, Precious.</h1>
                    </div>
                    <button className="button dark"><Plus size={16} /><span>New appointment</span></button>
                </div>

                <div className="stats">
                    <div className="stat">
                        <span className="mono">Today</span>
                        <strong>8</strong>
                        <small><span className="up">+2 </span>from last Wednesday</small>
                    </div>
                    <div className="stat">
                        <span className="mono">This month</span>
                        <strong>R18.4k</strong>
                        <small><span className="up">+12.8% </span>vs last month</small>
                    </div>
                    <div className="stat">
                        <span className="mono">New customers</span>
                        <strong>24</strong>
                        <small><span className="up">+6 </span>this month</small>
                    </div>
                    <div className="stat">
                        <span className="mono">Fill rate</span>
                        <strong>72%</strong>
                        <small>Across all services</small>
                    </div>
                </div>

                <div className="content-grid">
                    <section className="panel">
                        <div className="panel-head">
                            <h2>Today’s appointments</h2>
                            <Link className="mono" href="/dashboard">View calendar <ArrowUpRight size={13} /></Link>
                        </div>
                        {appointments.map((item) => (
                            <div className="appointment" key={item.time}>
                                <time>{item.time}</time>
                                <div className="avatar">{item.initials}</div>
                                <div>
                                    <b>{item.name}</b>
                                    <small>{item.service}</small>
                                </div>
                                <span className={`status ${item.status === "Pending" ? "pending" : ""}`}>{item.status}</span>
                            </div>
                        ))}
                    </section>

                    <aside className="panel">
                        <div className="panel-head">
                            <h2>Setup progress</h2>
                            <span className="mono">72%</span>
                        </div>
                        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>Your booking page is looking sharp. Finish these final details to keep the studio fully live.</p>
                        <div className="progress"><i /></div>
                        <ul className="checklist">
                            <li>Branding and contact details</li>
                            <li>Service menu and pricing</li>
                            <li>Opening hours and policy</li>
                            <li>Review and publish</li>
                        </ul>
                    </aside>
                </div>
            </main>
        </div>
    );
}
