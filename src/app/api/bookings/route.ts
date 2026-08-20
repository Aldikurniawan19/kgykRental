import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const body = await req.json();

    const bookingCode =
      body.bookingCode ||
      "KGYK-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const maxBooking = await prisma.booking.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });
    const nextId = (maxBooking?.id || 0) + 1;

    const booking = await prisma.booking.create({
      data: {
        id: nextId,
        bookingCode,
        userEmail: body.userEmail,
        userName: body.userName,
        userPhone: body.userPhone || "",
        carId: Number(body.carId || 1),
        carName: body.carName,
        startDate: body.startDate,
        endDate: body.endDate,
        duration: Number(body.duration || 1),
        serviceType: body.serviceType || "Sewa Mobil",
        pickupLocation: body.pickupLocation || "Kantor KGYK Yogyakarta",
        dropoffLocation: body.dropoffLocation || "Kantor KGYK Yogyakarta",
        notes: body.notes || "",
        totalPrice: Number(body.totalPrice),
        status: body.status || "Menunggu Verifikasi",
        paymentStatus: body.paymentStatus || "Belum Bayar",
        lateFeeHours: Number(body.lateFeeHours || 0),
        lateFee: Number(body.lateFee || 0),
        grandTotal: Number(body.grandTotal || body.totalPrice),
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
