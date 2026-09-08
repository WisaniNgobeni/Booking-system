import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Tandem | Bookings that move your business forward", description: "A beautifully simple booking platform for ambitious service businesses." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }