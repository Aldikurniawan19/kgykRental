import type { Booking } from "@/lib/app";

declare global {
  interface Window {
    __lastBooking?: Booking;
  }
}

export {};