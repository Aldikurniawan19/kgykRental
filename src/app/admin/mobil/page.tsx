"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";
import {
  PiPlus,
  PiPencil,
  PiTrash,
  PiCar,
  PiCheckCircle,
  PiXCircle,
  PiX,
  PiMagnifyingGlass,
  PiCheck,
} from "react-icons/pi";

interface CarItem {
  id: number;
  name: string;
  type: string;
  capacity: string;
  trans: string;
  price: number;
  img: string;
  status: boolean;
  isRented?: boolean;
  category: string;
  description: string;
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [statusConfirmCar, setStatusConfirmCar] = useState<CarItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "7 Penumpang",
    trans: "Matic",
    price: 400000,
    img: "/assets/imgMobil/toyotaVelos.png",
    status: true,
    category: "mpv",
    description: "",
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cars");
      if (res.ok) {
        const data = await res.json();
        setCars(data);
      }
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCar(null);
    setFormData({
      name: "",
      type: "MPV",
      capacity: "7 Penumpang",
      trans: "Matic",
      price: 400000,
      img: "/assets/imgMobil/toyotaVelos.png",
      status: true,
      category: "mpv",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (car: CarItem) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      type: car.type,
      capacity: car.capacity,
      trans: car.trans,
      price: car.price,
      img: car.img,
      status: car.status,
      category: car.category,
      description: car.description,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (car: CarItem) => {
    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !car.status }),
      });
      if (res.ok) {
        setCars((prev) =>
          prev.map((c) => (c.id === car.id ? { ...c, status: !c.status } : c))
        );
        const newStatusText = !car.status ? "Tersedia" : "Tidak Tersedia";
        triggerToast(`Status armada ${car.name} berhasil diubah menjadi "${newStatusText}".`);
      } else {
        triggerToast("Gagal memperbarui status ketersediaan armada.", "error");
      }
    } catch (err) {
      console.error("Failed to toggle car status:", err);
      triggerToast("Terjadi kesalahan koneksi saat mengubah status armada.", "error");
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      if (editingCar) {
        // Edit existing
        const res = await fetch(`/api/cars/${editingCar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setCars((prev) => prev.map((c) => (c.id === editingCar.id ? updated : c)));
          setIsModalOpen(false);
          triggerToast(`Berhasil memperbarui data mobil ${updated.name}!`);
        } else {
          const errData = await res.json().catch(() => ({}));
          triggerToast("Gagal mengedit data mobil: " + (errData.error || res.statusText), "error");
        }
      } else {
        // Add new
        const res = await fetch("/api/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const newCar = await res.json();
          setCars((prev) => [...prev, newCar]);
          setIsModalOpen(false);
          triggerToast(`Berhasil menambahkan unit armada baru ${newCar.name}!`);
        } else {
          const errData = await res.json().catch(() => ({}));
          triggerToast("Gagal menambahkan data mobil: " + (errData.error || res.statusText), "error");
        }
      }
    } catch (err) {
      console.error("Failed to save car:", err);
      triggerToast("Terjadi kesalahan jaringan saat menyimpan data mobil.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCar = async (id: number) => {
    const carToDelete = cars.find((c) => c.id === id);
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCars((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirmId(null);
        triggerToast(`Berhasil menghapus unit ${carToDelete?.name || "mobil"} dari daftar armada.`);
      } else {
        triggerToast("Gagal menghapus unit mobil.", "error");
      }
    } catch (err) {
      console.error("Failed to delete car:", err);
      triggerToast("Terjadi kesalahan koneksi saat menghapus unit mobil.", "error");
    }
  };

  const filteredCars = cars.filter((c) =>
    c.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    c.category.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold text-white transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500 shadow-emerald-600/20"
                : "bg-red-600 border-red-500 shadow-red-600/20"
            }`}
          >
            <PiCheckCircle className="text-lg shrink-0 text-white" />
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white p-0.5 cursor-pointer"
            >
              <PiX className="text-sm" />
            </button>
          </div>
        </div>
      )}
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy tracking-tight">Kelola Armada Mobil</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Tambah, edit spesifikasi, update harga sewa, dan atur ketersediaan unit.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <PiPlus className="text-base" /> Tambah Mobil Baru
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-soft flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari nama atau tipe mobil..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total Armada: <strong className="text-navy">{cars.length} Unit</strong> (
          {cars.filter((c) => c.status).length} Tersedia)
        </span>
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Memuat daftar armada mobil...
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <PiCar className="text-5xl mx-auto text-slate-300" />
            <p className="text-xs font-semibold">Tidak ada armada mobil ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-3.5 px-4 rounded-l-xl">Foto Unit</th>
                  <th className="py-3.5 px-4">Nama Mobil & Tipe</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Kapasitas & Transmisi</th>
                  <th className="py-3.5 px-4">Harga Sewa / Hari</th>
                  <th className="py-3.5 px-4">Status Unit</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="w-18 h-12 bg-slate-50 rounded-xl border border-slate-100 p-1 flex items-center justify-center">
                        <img
                          src={car.img}
                          alt={car.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-navy text-sm block mb-0.5">
                        {car.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {car.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                        {car.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700 block">
                        {car.capacity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{car.trans}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-navy text-sm">
                      {formatRupiah(car.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {car.isRented ? (
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-bold border border-blue-200/80 bg-blue-50 text-blue-700 inline-flex items-center gap-1.5 shadow-2xs"
                          title="Unit sedang digunakan oleh pelanggan dalam penyewaan aktif"
                        >
                          <PiCar className="text-xs" /> Sedang Disewa
                        </span>
                      ) : (
                        <button
                          onClick={() => setStatusConfirmCar(car)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            car.status
                              ? "bg-green-50 text-green-700 border-green-200/60 hover:bg-green-100"
                              : "bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100"
                          }`}
                        >
                          {car.status ? (
                            <>
                              <PiCheckCircle className="text-xs" /> Tersedia
                            </>
                          ) : (
                            <>
                              <PiXCircle className="text-xs" /> Nonaktif / Perbaikan
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(car)}
                          className="p-2 bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded-xl transition-all cursor-pointer"
                          title="Edit Mobil"
                        >
                          <PiPencil className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(car.id)}
                          className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-xl transition-all cursor-pointer"
                          title="Hapus Mobil"
                        >
                          <PiTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-navy">
                {editingCar ? "Edit Data Mobil" : "Tambah Mobil Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-navy flex items-center justify-center"
              >
                <PiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Mobil *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    placeholder="Contoh: Toyota Avanza Veloz"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tipe Kendaraan *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    placeholder="Contoh: MPV Modern"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori *
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="mpv">MPV</option>
                    <option value="suv">SUV</option>
                    <option value="city car">City Car</option>
                    <option value="van">Van / Minibus</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kapasitas *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    placeholder="Contoh: 7 Penumpang"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Transmisi *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    placeholder="Matic / Manual"
                    value={formData.trans}
                    onChange={(e) => setFormData({ ...formData, trans: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Harga Sewa / Hari (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={50000}
                    step={10000}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    URL Foto Kendaraan *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    placeholder="/assets/imgMobil/inovaReborn.png"
                    value={formData.img}
                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Deskripsi Kendaraan
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                  placeholder="Keterangan kondisi kendaraan, fasilitas pendukung..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <PiCheck className="text-base" /> {submitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl border border-red-200">
              <PiTrash />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy">Hapus Armada Mobil?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus data kendaraan dari database Prisma SQLite.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteCar(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Status Change Confirmation Modal */}
      {statusConfirmCar !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto text-2xl border border-blue-100/80">
              <PiCar />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy">Konfirmasi Ubah Status</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Ubah status ketersediaan armada <strong className="text-navy">{statusConfirmCar.name}</strong> menjadi{" "}
                <span className={!statusConfirmCar.status ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                  "{!statusConfirmCar.status ? "Tersedia" : "Tidak Tersedia"}"
                </span>?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setStatusConfirmCar(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const targetCar = statusConfirmCar;
                  setStatusConfirmCar(null);
                  handleToggleStatus(targetCar);
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Ya, Ubah Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
