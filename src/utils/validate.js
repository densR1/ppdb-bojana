/**
 * Aturan format yang bisa diperiksa tanpa menghubungi server, supaya orang tua
 * tahu ada yang salah saat masih di kolomnya — bukan setelah menekan kirim.
 * Server tetap memeriksa ulang; ini murni soal kenyamanan.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export const emailError = (value) => {
  const text = (value ?? "").trim();
  if (!text) return "";

  return EMAIL.test(text)
    ? ""
    : "That does not look like an email address. Example: nama@gmail.com";
};

/**
 * Sengaja tidak memaksa nomor Indonesia — orang tua bisa saja warga negara
 * lain. Yang ditolak hanya yang jelas bukan nomor telepon.
 */
export const phoneError = (value) => {
  const text = (value ?? "").trim();
  if (!text) return "";

  const cleaned = text.replace(/[\s.()-]/g, "");

  if (!/^\+?\d+$/.test(cleaned)) {
    return "Use digits only. Add + and the country code for a number outside Indonesia.";
  }

  const digits = cleaned.replace(/^\+/, "");

  // Batas atas mengikuti E.164; batas bawah dibuat longgar untuk nomor asing.
  if (digits.length < 7 || digits.length > 15) {
    return "That number looks too short or too long. Example: 081234567890";
  }

  return "";
};

export const nikError = (value) => {
  const text = (value ?? "").trim();
  if (!text) return "";

  return /^\d{16}$/.test(text) ? "" : "NIK must be exactly 16 digits.";
};
