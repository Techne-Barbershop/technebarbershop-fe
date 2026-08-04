"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import type {
  Artist,
  BookingState,
  PaymentMethod,
  Service,
  UserDetails,
} from "@/lib/types";

const TIMER_SECONDS = 5 * 60;

type Action =
  | { type: "SET_SERVICES"; payload: Service[] }
  | { type: "SET_ARTIST"; payload: Artist }
  | { type: "SET_DATETIME"; payload: { date: string; time: string } }
  | { type: "SET_USER"; payload: UserDetails }
  | { type: "SET_PAYMENT"; payload: PaymentMethod }
  | { type: "RESET" };

const initialState: BookingState = {
  services: [],
  artist: null,
  date: null,
  time: null,
  user: null,
  paymentMethod: null,
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
