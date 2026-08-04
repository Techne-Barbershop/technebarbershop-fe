"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Logo from "@/components/Logo";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-ink">
      <ImagePlaceholder
        icon="user"
        label="Hero Image"
        className="absolute inset-0 h-full w-full opacity-80"
        iconClassName="h-14 w-14 text-neutral-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 pt-4">
          <Logo light />
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-black bg-paper text-ink"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto w-full max-w-md px-5 pb-6">
          <p className="text-sm font-normal text-paper/90">Welcome to</p>
          <h1 className="mt-1.5 text-[44px] leading-[0.95] font-black tracking-tight text-paper uppercase">
            Hairnerds
            <br />
            Studio
          </h1>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-paper/80">
            Your journey to self-discovery starts here.
          </p>
          <button
            type="button"
            onClick={() => router.push("/book")}
            className="mt-8 flex h-14 w-full items-center justify-between rounded-2xl bg-ink px-6 text-[15px] font-semibold text-paper ring-1 ring-paper/30 transition active:scale-[0.99]"
          >
            Book Now
            <Icon name="arrowUpRight" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
