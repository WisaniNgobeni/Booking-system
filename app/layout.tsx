import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Smallbean | Booking infrastructure for service businesses", description: "Give your business a simple booking link customers can use anytime." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <html lang="en"><body>{children}</body></html>;
}