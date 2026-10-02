
"use client";

import { useState } from "react";
import { ShieldCheck, Save } from "lucide-react";

interface Permission {
  key: string;
  label: string;
  description: string;
}

interface RolePermissions {
  [role: string]: {
    [permission: string]: boolean;
  };
}

const permissions: Permission[] = [
  {
    key: "lihat",
    label: "Lihat Data",
    description: "Melihat data dan informasi dalam sistem.",
  },
  {
    key: "tambah",
    label: "Tambah Data",
    description: "Menambahkan data baru ke dalam sistem.",
  },
  {
    key: "ubah",
    label: "Ubah Data",
    description: "Mengubah data yang sudah tersimpan.",
  },
  {
    key: "hapus",
    label: "Hapus Data",
    description: "Menghapus data dari sistem.",
  },
  {
    key: "laporan",
    label: "Kelola Laporan",
    description: "Melihat dan mengelola laporan sistem.",
  },
];

const roles = ["Admin", "Petugas QC", "User"];

const initialPermissions: RolePermissions = {
  Admin: {
    lihat: true,
    tambah: true,
    ubah: true,
    hapus: true,
    laporan: true,
  },
  "Petugas QC": {
    lihat: true,
    tambah: true,
    ubah: true,
    hapus: false,
    laporan: true,
  },
  User: {
    lihat: true,
    tambah: false,
    ubah: false,
    hapus: false,
    laporan: false,
  },
};

export default function PermissionMatrix() {
  const [matrix, setMatrix] =
    useState<RolePermissions>(initialPermissions);

  const togglePermission = (
    role: string,
    permission: string
  ) => {
    setMatrix((previous) => ({
      ...previous,
      [role]: {
        ...previous[role],
        [permission]: !previous[role][permission],
      },
    }));
  };

  const handleSave = () => {
    // Simpan ke backend/API jika endpoint hak akses sudah tersedia.
    alert(
      "Perubahan hak akses masih tersimpan sementara di tampilan. Hubungkan ke API untuk menyimpan secara permanen."
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Matriks Hak Akses
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Atur izin akses berdasarkan peran pengguna.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Save size={18} />
          Simpan Perubahan
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-200 p-5">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              Pengaturan Permission
            </h2>
            <p className="text-sm text-gray-500">
              Centang izin yang diperbolehkan untuk setiap peran.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="min-w-56 px-5 py-4 font-semibold">
                  Hak Akses
                </th>

                {roles.map((role) => (
                  <th
                    key={role}
                    className="min-w-32 px-5 py-4 text-center font-semibold"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {permissions.map((permission) => (
                <tr key={permission.key} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">
                      {permission.label}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {permission.description}
                    </p>
                  </td>

                  {roles.map((role) => (
                    <td key={role} className="px-5 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={
                          matrix[role]?.[permission.key] ?? false
                        }
                        onChange={() =>
                          togglePermission(role, permission.key)
                        }
                        aria-label={`${permission.label} untuk ${role}`}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
          Catatan: konfigurasi awal merupakan contoh. Hak akses aktual
          harus disesuaikan dengan aturan perusahaan dan backend.
        </div>
      </div>
    </div>
  );
}