import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();

    const [totalCars, activeCars, bookings] = await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { status: true } }),
      prisma.booking.findMany(),
    ]);

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "Menunggu Verifikasi").length;
    const activeRentals = bookings.filter(
      (b) => b.status === "Dalam Penyewaan" || b.status === "Disetujui"
    ).length;

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "Lunas")
      .reduce((sum, b) => sum + (b.grandTotal || b.totalPrice), 0);

    return NextResponse.json({
      totalCars,
      activeCars,
      totalBookings,
      pendingBookings,
      activeRentals,
      totalRevenue,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
