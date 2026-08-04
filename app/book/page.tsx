"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import CheckoutCart from "@/components/CheckoutCart";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useBooking } from "@/context/BookingContext";
import { CATEGORIES } from "@/lib/data";
import { formatDuration, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Service, ServiceCategory } from "@/lib/types";

export default function ServiceSelectionPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [selected, setSelected] = useState<Service | null>(null);

  const selectedServices = state.services;
  const selectedIds = useMemo(
    () => new Set(selectedServices.map((service) => service.id)),
    [selectedServices],
  );

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  const isSelected = (service: Service) => selectedIds.has(service.id);

  const toggleService = (service: Service) => {
    if (isSelected(service)) {
      dispatch({
        type: "SET_SERVICES",
        payload: selectedServices.filter((item) => item.id !== service.id),
      });
    } else {
      dispatch({
        type: "SET_SERVICES",
        payload: [
          ...selectedServices.filter(
            (item) => item.categoryId !== service.categoryId,
          ),
          service,
        ],
      });
    }
  };

  const removeService = (id: string) => {
    dispatch({
      type: "SET_SERVICES",
      payload: selectedServices.filter((item) => item.id !== id),
    });
  };

  const chooseFromModal = (service: Service) => {
    toggleService(service);
    setSelected(null);
  };

  const getCategory = (categoryId: string): ServiceCategory | undefined =>
    CATEGORIES.find((category) => category.id === categoryId);

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">Choose Service</h1>
          <p className="text-[13px] text-graphite">
            Pick one service from each category you want.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col pb-24">
        {CATEGORIES.map((category) => (
          <section key={category.id} className="mt-7 first:mt-0">
            <ImagePlaceholder
              icon={category.icon}
              label={category.name}
              className="aspect-[16/6] w-full rounded-2xl border border-line"
              iconClassName="h-10 w-10"
            />
            <h2 className="mt-4 border-b border-line pb-2.5 text-[15px] font-bold tracking-wide text-ink uppercase">
              {category.name}
            </h2>
            <div className="divide-y divide-fog">
              {category.services.map((service) => {
                const picked = isSelected(service);
                return (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <ImagePlaceholder
                      icon={category.icon}
                      className="h-12 w-12 shrink-0 rounded-xl border border-line"
                      iconClassName="h-5 w-5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-bold text-ink">
                        {service.title}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-graphite">
                        {formatDuration(service.durationMinutes)}
                        <span className="mx-1.5 text-line">·</span>
                        <span className="font-semibold text-ink">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected(service)}
                        className="mt-1 text-[12px] font-medium text-graphite underline underline-offset-2 transition hover:text-ink"
                      >
                        View Detail
                      </button>
                    </div>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={picked}
                      aria-label={`${picked ? "Deselect" : "Select"} ${service.title}`}
                      onClick={() => toggleService(service)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-95",
                        picked
                          ? "border-ink bg-ink text-paper"
                          : "border-line text-transparent",
                      )}
                    >
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50"
            onClick={() => setSelected(null)}
          />
          <div className="animate-sheet-up relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-3xl bg-paper">
            <div className="no-scrollbar overflow-y-auto px-5 pt-3 pb-40">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-line" />

              <ImagePlaceholder
                icon={getCategory(selected.categoryId)?.icon ?? "image"}
                label="Service"
                className="mt-3 aspect-[16/7] w-full border-2 border-ink"
              />

              <h2 className="mt-4 text-[22px] font-bold text-ink">
                {selected.title}
              </h2>
              <p className="mt-1 text-[13px] text-graphite">
                {formatDuration(selected.durationMinutes)} ·{" "}
                {formatPrice(selected.price)}
              </p>

              <div className="mt-5">
                <h3 className="text-[13px] font-bold tracking-[0.15em] text-ink">
                  SERVICE INFO
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-graphite">
                  {selected.description}
                </p>
              </div>

              <div className="mt-5">
                <h3 className="text-[13px] font-bold tracking-[0.15em] text-ink">
                  WHAT YOU&apos;LL GET
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {selected.includes.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-mist px-3 py-2.5"
                    >
                      <Icon name={feature.icon} className="h-5 w-5 text-ink" />
                      <span className="text-[12.5px] font-medium text-graphite">
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-paper px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-2.5">
                {isSelected(selected) ? (
                  <>
                    <SecondaryButton onClick={() => setSelected(null)}>
                      Close
                    </SecondaryButton>
                  </>
                ) : (
                  <>
                    <SecondaryButton onClick={() => setSelected(null)}>
                      Close
                    </SecondaryButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <CheckoutCart
        items={selectedServices}
        onRemove={removeService}
        onNext={() => router.push("/book/artists")}
      />
    </div>
  );
}
