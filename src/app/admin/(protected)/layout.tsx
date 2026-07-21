import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "../actions";
import { AdminShell } from "@/components/admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email} logout={logoutAction}>
      {children}
    </AdminShell>
  );
}
