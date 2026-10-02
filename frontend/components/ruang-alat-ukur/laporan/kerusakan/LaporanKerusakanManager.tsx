
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  X,
  Trash2,
} from "lucide-react";

import type { LaporanKerusakanType } from "types/LaporanKerusakanTypes";

import {
  getLaporanKerusakan,
  createLaporanKerusakan,
  repairLaporanKerusakan,
  tandaiPermanenLaporanKerusakan,
} from "services/laporanKerusakanService";

type StatusKerusakan =
  | "bisa_diperbaiki"
  | "rusak_permanen"
  | "selesai_diperbaiki";

const statusLabel: Record<StatusKerusakan, string> = {
  bisa_diperbaiki: "Bisa Diperbaiki",
  rusak_permanen: "Rusak Permanen",
  selesai_diperbaiki: "Selesai Diperbaiki",
};

const statusStyle: Record<StatusKerusakan, string> = {
  bisa_diperbaiki: "bg-amber-100 text-amber-800",
  rusak_permanen: "bg-red-100 text-red-800",
  selesai_diperbaiki: "bg-green-100 text-green-800",
};

export default function LaporanKerusakanManager() {
  const [laporan, setLaporan] = useState<LaporanKerusakanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [showForm, setShowForm] = useState(false);
  const [repairTarget, setRepairTarget] =
    useState<LaporanKerusakanType | null>(null);

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    alat_ukur_id: "",
    peminjaman_id: "",
    jumlah: "1",
    keterangan: "",
    status: "bisa_diperbaiki" as
      | "bisa_diperbaiki"
      | "rusak_permanen",
    dilaporkan_oleh: "",
  });

  const [repairForm, setRepairForm] = useState({
    catatan: "",
    tingkat: "ringan" as "ringan" | "berat",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLaporanKerusakan();
      setLaporan(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data laporan kerusakan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = laporan.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch = [
      item.kode_barang,
      item.nama_barang,
      item.nama_peminjam,
      item.nama_pekerjaan,
      item.keterangan,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(keyword)
    );

    const matchesStatus =
      filterStatus === "semua" ||
      item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const countRepairable = laporan.filter(
    (item) => item.status === "bisa_diperbaiki"
  ).length;

  const countPermanent = laporan.filter(
    (item) => item.status === "rusak_permanen"
  ).length;

  const countCompleted = laporan.filter(
    (item) => item.status === "selesai_diperbaiki"
  ).length;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createLaporanKerusakan({
        tanggal: new Date(form.tanggal).toISOString(),
        alat_ukur_id: form.alat_ukur_id.trim(),
        peminjaman_id: form.peminjaman_id.trim(),
        jumlah: Number(form.jumlah),
        keterangan: form.keterangan.trim(),
        status: form.status,
        dilaporkan_oleh: form.dilaporkan_oleh.trim(),
      });

      setShowForm(false);
      setForm({
        tanggal: new Date().toISOString().slice(0, 10),
        alat_ukur_id: "",
        peminjaman_id: "",
        jumlah: "1",
        keterangan: "",
        status: "bisa_diperbaiki",
        dilaporkan_oleh: "",
      });

      setSuccess("Laporan kerusakan berhasil ditambahkan.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menambahkan laporan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRepair(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!repairTarget) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await repairLaporanKerusakan(
        repairTarget.id,
        repairForm.catatan,
        repairForm.tingkat
      );

      setRepairTarget(null);
      setRepairForm({ catatan: "", tingkat: "ringan" });
      setSuccess("Data perbaikan berhasil dikirim.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memproses perbaikan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePermanent(id: string) {
    const confirmed = window.confirm(
      "Tandai alat ini sebagai rusak permanen?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await tandaiPermanenLaporanKerusakan(id);
      setSuccess("Status kerusakan permanen berhasil diperbarui.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status kerusakan."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value: string | undefined) {
    if (!value || value === "-") return "-";

    // Service mengembalikan tanggal dalam format DD Mon YYYY, HH:mm.
    return value;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Laporan Kerusakan Alat Ukur
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau laporan dan tindak lanjut kerusakan alat ukur QC.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Muat Ulang
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Tambah Laporan
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError("")} aria-label="Tutup pesan">
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Laporan"
          value={laporan.length}
          icon={<Wrench size={23} />}
          color="text-blue-600"
        />
        <SummaryCard
          title="Bisa Diperbaiki"
          value={countRepairable}
          icon={<Clock size={23} />}
          color="text-amber-600"
        />
        <SummaryCard
          title="Rusak Permanen"
          value={countPermanent}
          icon={<AlertTriangle size={23} />}
          color="text-red-600"
        />
        <SummaryCard
          title="Selesai Diperbaiki"
          value={countCompleted}
          icon={<CheckCircle2 size={23} />}
          color="text-green-600"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold text-gray-800">
            Daftar Laporan
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-lg border px-3">
              <Search size={17} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari alat atau peminjam..."
                className="min-w-0 py-2 text-sm outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="semua">Semua Status</option>
              <option value="bisa_diperbaiki">Bisa Diperbaiki</option>
              <option value="rusak_permanen">Rusak Permanen</option>
              <option value="selesai_diperbaiki">Selesai Diperbaiki</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Kode / Nama Alat</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Peminjam</th>
                <th className="px-4 py-3">Jumlah Rusak</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <RefreshCw size={22} className="mx-auto mb-2 animate-spin" />
                    Memuat data laporan...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Wrench size={32} className="mx-auto mb-3 text-gray-400" />
                    Tidak ada laporan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const status = item.status as StatusKerusakan;
                  const knownStatus = status in statusLabel;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{index + 1}</td>

                      <td className="min-w-48 px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {item.nama_barang}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.kode_barang}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDate(item.tanggal_pengembalian)}
                      </td>

                      <td className="px-4 py-3">
                        <p>{item.nama_peminjam}</p>
                        <p className="text-xs text-gray-500">
                          {item.divisi}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {item.jumlah_rusak}
                      </td>

                      <td className="min-w-48 px-4 py-3">
                        <p>{item.keterangan}</p>
                        {item.catatan_perbaikan && (
                          <p className="mt-1 text-xs text-gray-500">
                            Catatan: {item.catatan_perbaikan}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            knownStatus
                              ? statusStyle[status]
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {knownStatus ? statusLabel[status] : item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.status === "bisa_diperbaiki" && (
                            <>
                              <button
                                onClick={() => {
                                  setRepairTarget(item);
                                  setRepairForm({
                                    catatan: item.catatan_perbaikan ?? "",
                                    tingkat: item.tingkat_kerusakan ?? "ringan",
                                  });
                                }}
                                title="Proses perbaikan"
                                aria-label="Proses perbaikan"
                                className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Wrench size={16} />
                              </button>

                              <button
                                onClick={() => void handlePermanent(item.id)}
                                disabled={saving}
                                title="Tandai rusak permanen"
                                aria-label="Tandai rusak permanen"
                                className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 text-sm text-gray-500">
          Menampilkan {filtered.length} dari {laporan.length} laporan
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-bold">
                Tambah Laporan Kerusakan
              </h2>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Tutup formulir"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 p-5">
              <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                Masukkan ID alat ukur dan ID peminjaman yang valid
                sesuai data pada backend.
              </p>

              <Field label="ID Alat Ukur">
                <input
                  required
                  value={form.alat_ukur_id}
                  onChange={(e) => setForm({ ...form, alat_ukur_id: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="ID alat ukur dari database"
                />
              </Field>

              <Field label="ID Peminjaman">
                <input
                  required
                  value={form.peminjaman_id}
                  onChange={(e) => setForm({ ...form, peminjaman_id: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="ID peminjaman yang terkait"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tanggal">
                  <input
                    required
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>

                <Field label="Jumlah Rusak">
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
              </div>

              <Field label="Nama Pelapor">
                <input
                  required
                  value={form.dilaporkan_oleh}
                  onChange={(e) => setForm({ ...form, dilaporkan_oleh: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Nama pelapor"
                />
              </Field>

              <Field label="Status Awal">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as typeof form.status,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="bisa_diperbaiki">Bisa Diperbaiki</option>
                  <option value="rusak_permanen">Rusak Permanen</option>
                </select>
              </Field>

              <Field label="Keterangan Kerusakan">
                <textarea
                  required
                  rows={3}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Jelaskan kondisi kerusakan..."
                />
              </Field>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {repairTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold">Proses Perbaikan</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {repairTarget.nama_barang} ({repairTarget.kode_barang})
                </p>
              </div>
              <button
                onClick={() => setRepairTarget(null)}
                aria-label="Tutup formulir"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRepair} className="space-y-4 p-5">
              <Field label="Tingkat Kerusakan">
                <select
                  value={repairForm.tingkat}
                  onChange={(e) =>
                    setRepairForm({
                      ...repairForm,
                      tingkat: e.target.value as "ringan" | "berat",
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="ringan">Ringan</option>
                  <option value="berat">Berat</option>
                </select>
              </Field>

              <Field label="Catatan Perbaikan">
                <textarea
                  rows={4}
                  value={repairForm.catatan}
                  onChange={(e) =>
                    setRepairForm({ ...repairForm, catatan: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Tuliskan hasil pemeriksaan atau perbaikan..."
                />
              </Field>

              <p className="text-xs text-gray-500">
                Status akhir mengikuti aturan endpoint perbaikan pada backend.
              </p>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setRepairTarget(null)}
                  className="rounded-lg border px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Memproses..." : "Kirim Perbaikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}