import Logo from "@/components/Logo";
import { Icon } from "@/components/icons";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-paper text-ink">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-paper px-5">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="flex items-center justify-center rounded-full bg-mist p-2 text-ink transition hover:bg-line/50"
          >
            <Icon name="user" className="h-4.5 w-4.5" />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
