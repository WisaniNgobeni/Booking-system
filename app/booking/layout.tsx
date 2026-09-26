import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage a booking", robots: { index: false, follow: false } };

export default function BookingManagementLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}