#!/usr/bin/env bash
#
# Build lalu kirim ke server. Jalankan dari folder repo:
#
#   ./deploy.sh
#
# Server hanya menyimpan hasil build — tidak ada source di sana.
set -euo pipefail

SERVER="ubuntu@43.133.136.92"
TARGET="/var/www/eraport/ppdb-bojana/dist/"
SITE="https://admission.bojanaislamicprimary.sch.id"

cd "$(dirname "$0")"

echo "==> Build (memakai .env.production)"
npm run build

# Kalau URL API produksi tidak ikut ter-bake, build memakai alamat lokal dan
# aplikasi akan mati total di server. Lebih baik berhenti di sini.
if ! grep -rq "api.bojanaislamicprimary.sch.id" dist/assets/*.js; then
  echo "GAGAL: URL API produksi tidak ada di hasil build. Cek .env.production." >&2
  exit 1
fi

echo "==> Kirim ke $SERVER"

# Sambungan ke server kadang putus-nyambung. Dicoba beberapa kali, dan berkas
# yang sudah separuh terkirim dilanjutkan, bukan diulang dari nol.
terkirim=0
for percobaan in 1 2 3 4 5; do
  if rsync -avz --delete --partial --timeout=30 dist/ "$SERVER:$TARGET"; then
    terkirim=1
    break
  fi
  echo "    percobaan $percobaan gagal, ulang sebentar lagi..." >&2
  sleep 5
done

if [ "$terkirim" -eq 0 ]; then
  echo "GAGAL: tidak bisa mengirim ke server setelah 5 percobaan." >&2
  echo "Cek koneksi internet, lalu jalankan lagi." >&2
  exit 1
fi

echo "==> Cek hasil"
LOCAL_BUNDLE=$(ls dist/assets/ | grep -E '^index-.*\.js$' | head -1)
LIVE_BUNDLE=$(curl -s "$SITE/" | grep -o 'assets/index-[a-z0-9]*\.js' | head -1)

if [ "assets/$LOCAL_BUNDLE" = "$LIVE_BUNDLE" ]; then
  echo "OK: $SITE sudah memakai $LOCAL_BUNDLE"
else
  echo "PERINGATAN: server masih menyajikan $LIVE_BUNDLE, bukan $LOCAL_BUNDLE" >&2
  exit 1
fi
