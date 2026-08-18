export interface Car {
  id: number;
  name: string;
  type: string;
  capacity: string;
  trans: string;
  price: number;
  img: string;
  status: boolean;
  category: "city car" | "mpv" | "suv" | "van";
  description: string;
}

export const cars: Car[] = [
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