import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromSession } from "../../lib/auth";

export const metadata: Metadata = { title: "Business dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = (await cookies()).get("smallbean_session")?.value;
    const user = await getUserFromSession(session);
    if (!user) redirect("/auth");
    return children;
}