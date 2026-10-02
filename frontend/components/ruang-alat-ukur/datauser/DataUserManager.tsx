
"use client";

import { useState } from "react";
import { Search, Users, UserPlus } from "lucide-react";

interface DataUser {
  id: number;
  nama: string;
  username: string;
  divisi: string;
  role: string;
}

export default function DataUserManager() {
  const [search, setSearch] = useState("");

  // Data awal kosong agar tidak menampilkan data pengguna palsu.
  const [users] = useState<DataUser[]>([]);

  const filteredUsers = users.filter((user) =>
    `${user.nama} ${user.username} ${user.divisi}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Data User
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data pengguna sistem inventaris QC.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            alert("Fitur tambah pengguna belum dihubungkan ke API.")
          }
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Tambah User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pengguna</p>
              <p className="mt-2 text-3xl font-bold text-gray-800">
                {users.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, username, atau divisi..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3 font-semibold">No.</th>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Username</th>
                <th className="px-5 py-3 font-semibold">Divisi</th>
                <th className="px-5 py-3 font-semibold">Role</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {user.nama}
                    </td>
                    <td className="px-5 py-4">{user.username}</td>
                    <td className="px-5 py-4">{user.divisi}</td>
                    <td className="px-5 py-4">{user.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    {search
                      ? "Data pengguna tidak ditemukan."
                      : "Belum ada data pengguna. Hubungkan komponen ke API untuk menampilkan data."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}