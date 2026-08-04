"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = email.toLowerCase();
    
    if (query.includes("admin")) {
      router.push("/admin");
    } else if (query.includes("worker")) {
      router.push("/worker");
    } else {
      router.push("/book");
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-paper text-ink">
      <div className="flex h-16 items-center px-5 border-b border-line">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-center text-[28px] font-black tracking-tight text-ink uppercase">
              Sign In
            </h1>
            <p className="mt-2 text-center text-[14px] text-graphite">
              Welcome back to Techné a Barbershop
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[13px] font-semibold text-ink"
              >
                Email Address
              </label>
              <div className="relative">
                <Icon
                  name="user"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-graphite"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@techne.com, worker@techne.com..."
                  className="h-12 w-full rounded-xl border border-line bg-paper pr-4 pl-10 text-[14px] text-ink outline-none placeholder:text-smoke focus:border-ink transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[13px] font-semibold text-ink"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-line bg-paper px-4 text-[14px] text-ink outline-none placeholder:text-smoke focus:border-ink transition-colors"
                />
              </div>
            </div>

            <PrimaryButton type="submit" className="w-full mt-2">
              Sign In
            </PrimaryButton>
          </form>

          <div className="mt-6 text-center text-[12.5px] text-graphite italic">
            *Mock Login: Use &quot;admin&quot;, &quot;worker&quot;, or anything else in the email to route accordingly.
          </div>
        </div>
      </div>
    </div>
  );
}
