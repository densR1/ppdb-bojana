// Diambil dari VITE_API_ENDPOINT saat build. Nilai default menunjuk API lokal
// supaya `npm run dev` jalan tanpa menyiapkan .env lebih dulu; build produksi
// wajib menyetelnya lewat .env.production atau variabel di server CI.
export const API_ENDPOINT =
  import.meta.env.VITE_API_ENDPOINT ?? "http://localhost:8000/api";
