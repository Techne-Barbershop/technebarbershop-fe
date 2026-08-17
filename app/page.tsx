"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Logo from "@/components/Logo";
import { useBooking } from "@/context/BookingContext";

export default function LandingPage() {
  const router = useRouter();
  const { dispatch } = useBooking();
  const [customer, setCustomer] = useState<{name: string; phone: string; email: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("http://localhost:8080/api/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setCustomer(data.data);
        } else {
          localStorage.removeItem("customer_token");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleContinueAs = () => {
    if (customer) {
      dispatch({
        type: "SET_USER",
        payload: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        },
      });
    }
    router.push("/book");
  };

  const handleBookOther = () => {
    localStorage.removeItem("customer_token");
    setCustomer(null);
    router.push("/book");
  };

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

        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto w-full max-w-md px-5 pb-6">
          <p className="text-sm font-normal text-paper/90">Welcome to</p>
          <h1 className="mt-1.5 text-[44px] leading-[0.95] font-black tracking-tight text-paper uppercase">
            Techné a
            <br />
            Barbershop
          </h1>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-paper/80">
            Crafted Cuts, Modern Style — Where Precision Meets Personality.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {!loading && customer ? (
              <>
                <button
                  type="button"
                  onClick={handleContinueAs}
                  className="flex h-14 w-full items-center justify-between rounded-2xl bg-ink px-6 text-[15px] font-semibold text-paper ring-1 ring-paper/30 transition active:scale-[0.99]"
                >
                  Continue as {customer.name.split(" ")[0]}
                  <Icon name="arrowUpRight" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleBookOther}
                  className="flex h-14 w-full items-center justify-between rounded-2xl bg-paper px-6 text-[15px] font-semibold text-ink ring-1 ring-ink/10 transition active:scale-[0.99]"
                >
                  Book as Other Customer
                  <Icon name="arrowUpRight" className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/book")}
                className="flex h-14 w-full items-center justify-between rounded-2xl bg-ink px-6 text-[15px] font-semibold text-paper ring-1 ring-paper/30 transition active:scale-[0.99]"
              >
                Book Now
                <Icon name="arrowUpRight" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
