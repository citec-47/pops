import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "../actions";
import { AdminNav } from "@/components/admin-nav";
import { Logo } from "@/components/logo";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-bone">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin">
              <Logo />
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden text-sm text-muted hover:text-clay sm:inline"
            >
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-line px-5 py-2 sm:hidden">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
