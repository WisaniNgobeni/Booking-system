import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromSession } from "../../lib/auth";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = (await cookies()).get("smallbean_session")?.value;
    const user = await getUserFromSession(session);
    if (!user) redirect("/auth");
    return children;
}