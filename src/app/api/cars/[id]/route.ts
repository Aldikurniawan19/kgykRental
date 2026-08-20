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
    const carId = Number(id);

    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error("GET /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const carId = Number(id);
    const body = await req.json();

    const car = await prisma.car.update({
      where: { id: carId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type }),
        ...(body.capacity && { capacity: body.capacity }),
        ...(body.trans && { trans: body.trans }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.img && { img: body.img }),
        ...(body.status !== undefined && { status: Boolean(body.status) }),
        ...(body.category && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error("PUT /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const carId = Number(id);

    await prisma.car.delete({
      where: { id: carId },
    });

    return NextResponse.json({ success: true, id: carId });
  } catch (error) {
    console.error("DELETE /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
