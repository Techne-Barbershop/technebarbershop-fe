"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useBooking } from "@/context/BookingContext";
import { ARTISTS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

import { api } from "@/lib/api";

export default function ArtistSelectionPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [query, setQuery] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    state.artist?.id ?? null,
  );

  useEffect(() => {
    api<{ data: { staff: any[] } }>("/api/staff")
      .then((res) => {
        setStaffList(res.data.staff || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const artists = useMemo(() => {
    let list = staffList
      .filter((s) => s.role === "CAPSTER")
      .map((s) => ({
        id: s.user_id,
        name: s.name,
        specialty: "",
        rating: 0,
        reviewCount: 0,
        basePrice: 0,
        imageUrl: s.image_url,
      }));
      
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter((artist) =>
        artist.name.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [query, staffList]);

  const selectArtist = (id: string) => {
    setSelectedId(id);
    const artist = artists.find((item) => item.id === id);
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
      </div>

      <div className="mt-6 flex flex-col gap-4 pb-4">
        {loading && <p className="text-center text-sm text-gray-500 mt-10">Memuat kapster...</p>}
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
                {artist.imageUrl ? (
                  <img src={artist.imageUrl} alt={artist.name} className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <ImagePlaceholder
                    icon="user"
                    label={artist.name}
                    className="aspect-[16/9] w-full"
                    iconClassName="h-12 w-12 text-neutral-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

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
                  </div>
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
