import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";
import { Car } from "@prisma/client";

export async function GET() {
  try {
    await ensureDbInitialized();
    const [cars, activeRentals] = await Promise.all([
      prisma.car.findMany({
        orderBy: { id: "desc" },
      }),
      prisma.booking.findMany({
        where: { status: "Dalam Penyewaan" },
        select: { carId: true, carName: true },
      }),
    ] as const);

    const activeRentedCarIds = new Set(activeRentals.map((b) => b.carId));
    const activeRentedCarNames = new Set(activeRentals.map((b) => b.carName));

    const carsWithStatus = cars.map((car: Car) => {
      const isRented = activeRentedCarIds.has(car.id) || activeRentedCarNames.has(car.name);
      return {
        ...car,
        isRented,
      };
    });

    return NextResponse.json(carsWithStatus);
  } catch (error) {
    console.error("GET /api/cars error:", error);
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    try {
      await ensureDbInitialized();
    } catch (dbInitErr) {
      console.warn("Db init warning in POST /api/cars:", dbInitErr);
    }

    const body = await req.json();

    // Calculate next ID explicitly to prevent SQLite autoincrement ID collisions
    const maxCar = await prisma.car.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });
    const nextId = (maxCar?.id || 0) + 1;

    const car = await prisma.car.create({
      data: {
        id: nextId,
        name: String(body.name || "Mobil Baru"),
        type: String(body.type || "MPV"),
        capacity: String(body.capacity || "7 Penumpang"),
        trans: String(body.trans || "Matic"),
        price: Number(body.price || 400000),
        img: String(body.img || "/assets/imgMobil/toyotaVelos.png"),
        status: body.status !== undefined ? Boolean(body.status) : true,
        category: String(body.category || "mpv"),
        description: String(body.description || ""),
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/cars error details:", error);
    return NextResponse.json(
      { error: error?.message || String(error) || "Failed to create car" },
      { status: 500 }
    );
  }
}
