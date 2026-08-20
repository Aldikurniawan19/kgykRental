import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCars = [
  {
    id: 1,
    name: "Toyota Veloz",
    type: "MPV Modern",
    capacity: "7 Penumpang",
    trans: "Matic",
    price: 400000,
    img: "/assets/imgMobil/toyotaVelos.png",
    status: true,
    category: "mpv",
    description:
      "Mobil MPV modern dan stylish dengan ruang kabin lega, fitur keselamatan canggih, dan efisiensi bahan bakar optimal. Sangat ideal untuk perjalanan keluarga di dalam maupun luar kota.",
  },
  {
    id: 2,
    name: "Toyota Innova Reborn",
    type: "MPV Premium",
    capacity: "7 Penumpang",
    trans: "Matic / Manual",
    price: 550000,
    img: "/assets/imgMobil/inovaReborn.png",
    status: true,
    category: "mpv",
    description:
      "MPV premium andalan dengan kenyamanan ekstra, suspensi empuk, kabin senyap, dan performa mesin diesel yang bertenaga. Pilihan tepat untuk perjalanan bisnis maupun liburan keluarga dengan prestise tinggi.",
  },
  {
    id: 3,
    name: "Jeep Wrangler Rubicon",
    type: "SUV 4x4",
    capacity: "5 Penumpang",
    trans: "Matic",
    price: 1750000,
    img: "/assets/imgMobil/rubicon.png",
    status: true,
    category: "suv",
    description:
      "SUV ikonik 4x4 dengan performa off-road legendaris dan desain gagah nan maskulin. Memberikan pengalaman berkendara penuh gengsi, aman di segala medan, dan siap menemani petualangan eksklusif Anda.",
  },
  {
    id: 4,
    name: "Toyota Alphard",
    type: "Luxury MPV",
    capacity: "7 Penumpang",
    trans: "Matic",
    price: 1800000,
    img: "/assets/imgMobil/toyotaAlpard.png",
    status: true,
    category: "mpv",
    description:
      "Kendaraan MPV ultra mewah dengan captain seat berbalut kulit premium, interior elegan, dan peredam kabin kelas atas. Sangat prestisius untuk tamu VIP, eksekutif bisnis, maupun momen pernikahan spesial.",
  },
  {
    id: 5,
    name: "Toyota Hiace Commuter",
    type: "Van / Minibus",
    capacity: "12-15 Penumpang",
    trans: "Manual",
    price: 1100000,
    img: "/assets/imgMobil/toyotaHiaice.png",
    status: true,
    category: "van",
    description:
      "Minibus komersial dengan kapasitas penumpang besar dan legroom yang lega. Sangat ideal untuk rombongan wisata keluarga besar, study tour, perjalanan ziarah, atau antar-jemput delegasi instansi.",
  },
];

const sampleBookings = [
  {
    bookingCode: "KGYK-N97AVH",
    userEmail: "aldi@gmail.com",
    userName: "Aldi Kurniawan",
    userPhone: "081234567890",
    carId: 2,
    carName: "Toyota Innova Reborn",
    startDate: "2026-08-18",
    endDate: "2026-08-20",
    duration: 3,
    serviceType: "Sewa Mobil",
    pickupLocation: "Kantor KGYK Yogyakarta",
    dropoffLocation: "Kantor KGYK Yogyakarta",
    notes: "Mohon siapkan unit yang bersih dan wangi.",
    totalPrice: 1650000,
    status: "Menunggu Verifikasi",
    paymentStatus: "Belum Bayar",
    lateFeeHours: 0,
    lateFee: 0,
    grandTotal: 1650000,
  },
  {
    bookingCode: "KGYK-DW5VCY",
    userEmail: "aldi@gmail.com",
    userName: "Aldi Kurniawan",
    userPhone: "081234567890",
    carId: 1,
    carName: "Toyota Veloz",
    startDate: "2026-08-20",
    endDate: "2026-08-21",
    duration: 2,
    serviceType: "Sewa Mobil",
    pickupLocation: "Kantor KGYK Yogyakarta",
    dropoffLocation: "Kantor KGYK Yogyakarta",
    notes: "Diantar ke Bandara YIA jika memungkinkan.",
    totalPrice: 800000,
    status: "Disetujui",
    paymentStatus: "Lunas",
    lateFeeHours: 0,
    lateFee: 0,
    grandTotal: 800000,
  },
  {
    bookingCode: "KGYK-RB889X",
    userEmail: "budi@yahoo.com",
    userName: "Budi Santoso",
    userPhone: "085678901234",
    carId: 3,
    carName: "Jeep Wrangler Rubicon",
    startDate: "2026-08-10",
    endDate: "2026-08-12",
    duration: 2,
    serviceType: "Mobil + Driver",
    pickupLocation: "Hotel Tentrem Yogyakarta",
    dropoffLocation: "Bandara YIA",
    notes: "Perjalanan wisata Gunung Merapi.",
    totalPrice: 3500000,
    status: "Selesai",
    paymentStatus: "Lunas",
    lateFeeHours: 0,
    lateFee: 0,
    grandTotal: 3500000,
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed Cars
  for (const car of defaultCars) {
    await prisma.car.upsert({
      where: { id: car.id },
      update: car,
      create: car,
    });
  }

  // Seed Bookings
  for (const booking of sampleBookings) {
    await prisma.booking.upsert({
      where: { bookingCode: booking.bookingCode },
      update: booking,
      create: booking,
    });
  }

  // Seed Setting
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      phone: "+62 881-0233-31644",
      whatsapp: "62881023331644",
      email: "info@kgykrental.com",
      address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
    },
    create: {
      id: 1,
      phone: "+62 881-0233-31644",
      whatsapp: "62881023331644",
      email: "info@kgykrental.com",
      address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
