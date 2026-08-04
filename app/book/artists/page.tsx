"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useBooking } from "@/context/BookingContext";
import { ARTISTS } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type SortMode = "default" | "az" | "rating";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "az", label: "A-Z" },
  { id: "rating", label: "Highest Rating" },
];

export default function ArtistSelectionPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [selectedId, setSelectedId] = useState<string | null>(
    state.artist?.id ?? null,
  );

  const artists = useMemo(() => {
    let list = [...ARTISTS];
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter((artist) =>
        `${artist.name} ${artist.specialty}`.toLowerCase().includes(needle),
      );
    }
    if (sort === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [query, sort]);

  const selectArtist = (id: string) => {
    setSelectedId(id);
    const artist = ARTISTS.find((item) => item.id === id);
    if (artist) dispatch({ type: "SET_ARTIST", payload: artist });
  };

  const handleNext = () => {
    if (selectedId) router.push("/book/schedule");
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">
            Available Hair Artists
          </h1>
          <p className="text-[13px] text-graphite">
            Select the artist you want to book with.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-graphite"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search barber by name..."
            className="h-12 w-full rounded-xl border border-line bg-paper pr-4 pl-11 text-[14px] text-ink outline-none placeholder:text-smoke focus:border-ink"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[12.5px] font-semibold text-graphite">
            Sort by:
          </span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSort(option.id)}
              className={cn(
                "rounded-full px-4 py-2 text-[12.5px] font-semibold transition active:scale-95",
                sort === option.id
                  ? "bg-ink text-paper"
                  : "border border-line bg-paper text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 pb-4">
        {artists.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-graphite">
            No artists match your search.
          </p>
        ) : (
          artists.map((artist) => {
            const isSelected = selectedId === artist.id;
            return (
              <div
                key={artist.id}
                onClick={() => selectArtist(artist.id)}
                className={cn(
                  "relative overflow-hidden rounded-3xl border text-left cursor-pointer transition active:scale-[0.99]",
                  isSelected
                    ? "border-ink ring-2 ring-ink ring-offset-2"
                    : "border-line",
                )}
              >
                <ImagePlaceholder
                  icon="user"
                  label={artist.name}
                  className="aspect-[16/9] w-full"
                  iconClassName="h-12 w-12 text-neutral-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                  <span className="flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[12px] font-semibold text-ink">
                    <Icon name="star" className="h-3.5 w-3.5 text-ink" />
                    {artist.rating.toFixed(1)}
                  </span>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink">
                    From {formatPrice(artist.basePrice)}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition",
                      isSelected
                        ? "border-ink bg-ink text-paper"
                        : "border-paper bg-paper/20 text-transparent",
                    )}
                  >
                    <Icon name="check" className="h-4 w-4" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[17px] font-bold text-paper">
                      {artist.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-paper/75">
                      {artist.specialty} · {artist.reviewCount} reviews
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-paper"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomBar>
        <PrimaryButton
          onClick={handleNext}
          disabled={!selectedId}
          className={cn(!selectedId && "cursor-not-allowed")}
        >
          Next
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
