import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const bookingId = Number(id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const bookingId = Number(id);
    const body = await req.json();

    const currentBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    let paymentMethodToUpdate: string | undefined = undefined;
    if (body.paymentMethod !== undefined) {
      paymentMethodToUpdate = String(body.paymentMethod);
    }

    // Rule 1: Cannot set status to "Selesai" if paymentStatus is not "Lunas"
    if (body.status === "Selesai") {
      const effectivePaymentStatus = body.paymentStatus !== undefined ? body.paymentStatus : currentBooking.paymentStatus;
      if (effectivePaymentStatus !== "Lunas") {
        return NextResponse.json(
          { error: "Tidak dapat menandai pesanan Selesai. Status pembayaran belum LUNAS!" },
          { status: 400 }
        );
      }
    }

    // Rule 2: Cannot set paymentStatus to "Lunas" if paymentMethod is missing or "Belum Dipilih"
    if (body.paymentStatus === "Lunas") {
      const effectiveMethod = paymentMethodToUpdate !== undefined ? paymentMethodToUpdate : currentBooking.paymentMethod;
      if (!effectiveMethod || effectiveMethod === "Belum Dipilih") {
        return NextResponse.json(
          { error: "Pilih Metode Pembayaran terlebih dahulu sebelum mengonfirmasi pembayaran LUNAS!" },
          { status: 400 }
        );
      }
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.paymentStatus !== undefined) dataToUpdate.paymentStatus = body.paymentStatus;
    if (body.lateFeeHours !== undefined) dataToUpdate.lateFeeHours = Number(body.lateFeeHours);
    if (body.lateFee !== undefined) dataToUpdate.lateFee = Number(body.lateFee);
    if (body.grandTotal !== undefined) dataToUpdate.grandTotal = Number(body.grandTotal);
    if (body.pickupLocation !== undefined) dataToUpdate.pickupLocation = body.pickupLocation;
    if (body.dropoffLocation !== undefined) dataToUpdate.dropoffLocation = body.dropoffLocation;
    if (body.notes !== undefined) dataToUpdate.notes = body.notes;

    if (body.paymentStatus === "Lunas" && !body.paidAt) {
      dataToUpdate.paidAt = new Date();
    }
    if (body.status === "Dalam Penyewaan" && !body.releasedAt) {
      dataToUpdate.releasedAt = new Date();
    }
    if (body.status === "Selesai" && !body.returnedAt) {
      dataToUpdate.returnedAt = new Date();
    }

    if (paymentMethodToUpdate !== undefined) {
      dataToUpdate.paymentMethod = paymentMethodToUpdate;
    }

    let booking;
    if (Object.keys(dataToUpdate).length > 0) {
      booking = await prisma.booking.update({
        where: { id: bookingId },
        data: dataToUpdate,
      });
    } else {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
    }

    // Auto-sync Car status when booking status changes:
    // 1. "Dalam Penyewaan" -> set Car status = false (Tidak Tersedia)
    // 2. "Selesai" or "Ditolak" -> set Car status = true (Tersedia) if no other active rentals
    try {
      if (body.status === "Dalam Penyewaan" && booking?.carId) {
        const car = await prisma.car.findUnique({ where: { id: booking.carId } });
        if (car) {
          await prisma.car.update({
            where: { id: booking.carId },
            data: { status: false },
          });
        }
      } else if ((body.status === "Selesai" || body.status === "Ditolak") && booking?.carId) {
        const car = await prisma.car.findUnique({ where: { id: booking.carId } });
        if (car) {
          const otherActive = await prisma.booking.findFirst({
            where: {
              carId: booking.carId,
              id: { not: bookingId },
              status: "Dalam Penyewaan",
            },
          });
          if (!otherActive) {
            await prisma.car.update({
              where: { id: booking.carId },
              data: { status: true },
            });
          }
        }
      }
    } catch (autoSyncErr) {
      console.warn("Auto-sync car status warning:", autoSyncErr);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const bookingId = Number(id);

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ success: true, id: bookingId });
  } catch (error) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
