"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import type {
  Artist,
  BookingState,
  PaymentMethod,
  UserDetails,
} from "@/lib/types";
import type { Service } from "@/lib/types/admin";

const TIMER_SECONDS = 5 * 60;

type Action =
  | { type: "SET_SERVICES"; payload: Service[] }
  | { type: "SET_ARTIST"; payload: Artist }
  | { type: "SET_DATETIME"; payload: { date: string; time: string } }
  | { type: "SET_USER"; payload: UserDetails }
  | { type: "SET_PAYMENT"; payload: PaymentMethod }
  | { type: "SET_RESERVATION"; payload: { id: string; expiresAt: string } }
  | { type: "HYDRATE"; payload: BookingState }
  | { type: "RESET" };

const initialState: BookingState = {
  services: [],
  artist: null,
  date: null,
  time: null,
  user: null,
  paymentMethod: null,
  reservationId: null,
  expiresAt: null,
};

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "SET_SERVICES":
      return { ...state, services: action.payload };
    case "SET_ARTIST":
      return { ...state, artist: action.payload };
    case "SET_DATETIME":
      return { ...state, date: action.payload.date, time: action.payload.time };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_PAYMENT":
      return { ...state, paymentMethod: action.payload };
    case "SET_RESERVATION":
      return { ...state, reservationId: action.payload.id, expiresAt: action.payload.expiresAt };
    case "HYDRATE":
      return action.payload;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface BookingContextValue {
  state: BookingState;
  dispatch: Dispatch<Action>;
  timer: number;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("booking_state");
    const isInstructionsPage = window.location.pathname === "/book/payment/instructions";
    const isBookingPage = window.location.pathname.startsWith("/book");

    if (isInstructionsPage && savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: "HYDRATE", payload: parsed });
      } catch (e) {
        localStorage.removeItem("booking_state");
        window.location.replace("/");
      }
    } else {
      localStorage.removeItem("booking_state");
      if (isBookingPage && window.location.pathname !== "/book") {
        window.location.replace("/");
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("booking_state", JSON.stringify(state));
    }
  }, [state, isHydrated]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      timer,
      reset: () => {
        dispatch({ type: "RESET" });
        setTimer(TIMER_SECONDS);
      },
    }),
    [state, timer],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
