export type ToastType = "success" | "error" | "warning" | "info";

export interface AppUser {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface Booking {
  id: number;
  bookingCode: string;
  userEmail: string;
  userName: string;
  carId: number;
  carName: string;
  startDate: string;
  endDate: string;
  duration: number;
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string;
  notes: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paidAt: string | null;
  releasedAt: string | null;
  returnedAt: string | null;
  lateFeeHours: number;
  lateFee: number;
  grandTotal: number;
}

export const getCurrentUser = (): AppUser | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("kgyk_current_user") || "null");
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: AppUser) => {
  localStorage.setItem("kgyk_current_user", JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem("kgyk_current_user");
};

export const getUsers = (): AppUser[] => {
  try {
    return JSON.parse(localStorage.getItem("kgyk_users") || "[]");
  } catch {
    return [];
  }
};

export const setUsers = (users: AppUser[]) => {
  localStorage.setItem("kgyk_users", JSON.stringify(users));
};

export const getBookings = (): Booking[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("kgyk_bookings") || "[]");
  } catch {
    return [];
  }
};

export const setBookings = (bookings: Booking[]) => {
  localStorage.setItem("kgyk_bookings", JSON.stringify(bookings));
};

export const notifyAuthChanged = () => {
  window.dispatchEvent(new CustomEvent("auth-changed"));
};

export const showToast = (message: string, type: ToastType = "success") => {
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));
};

export const openLoginModal = () => {
  window.dispatchEvent(new CustomEvent("app:open-login"));
};

export const openRegisterModal = () => {
  window.dispatchEvent(new CustomEvent("app:open-register"));
};

export const openCarDetail = (id: number) => {
  window.dispatchEvent(new CustomEvent("app:open-car-detail", { detail: { id } }));
};

export const bookCar = (carName: string) => {
  window.dispatchEvent(new CustomEvent("app:book-car", { detail: { carName } }));
};

export const generateBookingCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KGYK-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};