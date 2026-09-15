import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/id";

Font.register({ family: "Amiri", src: "/font/amiri.ttf" });

const SALAM_PEMBUKA = "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ";
const SALAM_PENUTUP = "وَ " + SALAM_PEMBUKA;

const rupiah = (nilai) =>
  `Rp. ${new Intl.NumberFormat("id-ID").format(nilai ?? 0)},-`;

const tanggal = (nilai) =>
  nilai ? dayjs(nilai).locale("id").format("D MMMM YYYY") : "-";

const s = StyleSheet.create({
  page: {
    paddingTop: 135,
    paddingBottom: 95,
    paddingHorizontal: 62,
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  latar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 595.28,
    height: 841.89,
    objectFit: "fill",
  },

  nomor: { fontFamily: "Times-Bold" },
  kota: { textAlign: "right", marginTop: 14 },
  tujuan: { fontFamily: "Times-Bold", marginTop: 14 },

  arab: {
    fontFamily: "Amiri",
    fontSize: 13,
    textAlign: "right",
    marginTop: 16,
  },
  hal: {
    fontFamily: "Times-Bold",
    textDecoration: "underline",
    marginTop: 16,
  },
  alinea: { marginTop: 12, textAlign: "justify" },
  tebal: { fontFamily: "Times-Bold" },
  sorot: { fontFamily: "Times-Bold", backgroundColor: "#FFF17A" },

  tabel: { marginTop: 8, borderWidth: 1, borderColor: "#000", fontSize: 9.5 },
  baris: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  barisAkhir: { flexDirection: "row", backgroundColor: "#FDF3DC" },
  urut: {
    width: 20,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  pos: { flexGrow: 1, paddingVertical: 2, paddingHorizontal: 5 },
  nilai: {
    width: 90,
    paddingVertical: 2,
    paddingHorizontal: 5,
    textAlign: "right",
    borderLeftWidth: 1,
    borderLeftColor: "#000",
  },
  totalTeks: {
    flexGrow: 1,
    paddingVertical: 2,
    textAlign: "center",
    fontFamily: "Times-Bold",
  },

  ttd: { marginTop: 18, alignItems: "flex-end" },
  ttdBlok: { width: 215, textAlign: "center" },
  ruangTtd: { height: 58 },
  namaTtd: { fontFamily: "Times-Bold", textDecoration: "underline" },
});

const PUJIAN =
  "Puji dan syukur kami panjatkan kepada Allah Subhanahuwataala yang senantiasa memberikan nikmat Islam dan anugrahnya kepada kita semua serta salawat dan salam kami haturkan kepada junjungan kita Nabi Muhammad Sallallahualaiwasalam.";

const PENUTUP =
  "Demikian hal – hal tersebut dibuat. Semoga Allah senantiasa meridhoi setiap keputusan yang kita ambil Amiin. Atas kerjasama & perhatiannya kami ucapkan terima kasih";

function LetterPdf({ data }) {
  return (
    <Document title={`Surat Penerimaan ${data.student_name ?? ""}`}>
      <Page size="A4" style={s.page}>
        <Image style={s.latar} src="/images/kop-surat.png" fixed />

        <Text style={s.nomor}>Nomor: {data.letter_number}</Text>

        <Text style={s.kota}>
          {data.place}, {tanggal(data.issued_at)}
        </Text>

        <View style={s.tujuan}>
          <Text>Kepada YTH.</Text>
          <Text>Orangtua/ Wali Murid</Text>
          <Text>{data.student_name ?? "-"}</Text>
          <Text>Di Tempat</Text>
        </View>

        <Text style={s.arab}>{SALAM_PEMBUKA}</Text>

        <Text style={s.hal}>Hal : Surat Penerimaan Siswa</Text>

        <Text style={s.alinea}>{PUJIAN}</Text>

        <Text style={s.alinea}>
          Kami menginformasikan dengan ini Ananda{" "}
          <Text style={s.tebal}>{data.student_name ?? "-"}</Text> dinyatakan{" "}
          <Text style={s.sorot}>DITERIMA</Text> untuk menjadi murid di{" "}
          <Text style={s.tebal}>{data.school_name}</Text> untuk tahun pelajaran{" "}
          <Text style={s.tebal}>{data.academic_year ?? "-"}</Text>.
        </Text>

        <Text style={s.alinea}>
          Dengan diterimanya Ananda sebagai peserta didik di {data.school_name},
          kami mohon kepada Bapak/Ibu, Orang Tua/Wali Murid untuk dapat
          melengkapi seluruh berkas persyaratan administrasi sesuai dengan
          ketentuan yang berlaku di sekolah kami.
        </Text>

        <Text style={s.alinea}>
          Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian dan
          kerja sama Bapak/Ibu, kami ucapkan terima kasih.
        </Text>

        <Text style={s.alinea}>
          Dengan demikian maka orangtua/wali murid sudah dapat melakukan
          pembayaran uang sekolah dengan perincian sebagai berikut:
        </Text>

        <View style={s.tabel}>
          {(data.fees ?? []).map((item, index) => (
            <View key={item.label} style={s.baris}>
              <Text style={s.urut}>{index + 1}.</Text>
              <Text style={s.pos}>{item.label}</Text>
              <Text style={s.nilai}>{rupiah(item.amount)}</Text>
            </View>
          ))}

          <View style={s.barisAkhir}>
            <Text style={s.totalTeks}>Total</Text>
            <Text style={[s.nilai, s.tebal]}>{rupiah(data.fee_total)}</Text>
          </View>
        </View>

        <Text style={s.alinea}>
          Seluruh biaya pendidikan yang telah dibayarkan, baik secara penuh
          maupun angsuran,{" "}
          <Text style={s.tebal}>
            tidak dapat dibatalkan, dikembalikan, atau dialihkan
          </Text>{" "}
          dalam kondisi apa pun.
        </Text>

        <Text style={s.alinea}>
          Pembayaran dapat dilakukan dengan cara transfer ke rekening di bawah :
        </Text>
        <Text style={s.tebal}>
          {data.bank?.name} - {data.bank?.holder}
        </Text>
        <Text style={s.tebal}>{data.bank?.number}</Text>

        <Text style={s.alinea}>
          Setelah dokumen pendukung dikirim, bukti transfer mohon{" "}
          <Text style={s.tebal}>
            diunggah melalui halaman tagihan pada web pendaftaran
          </Text>
          .
        </Text>

        <Text style={s.alinea}>
          Apabila belum ada pembayaran sampai dengan batas waktu diatas,{" "}
          <Text style={s.tebal}>
            kami menyatakan siswa tersebut telah mengundurkan diri
          </Text>
          . {PENUTUP}
        </Text>

        <Text style={s.arab}>{SALAM_PENUTUP}</Text>

        <View style={s.ttd}>
          <View style={s.ttdBlok}>
            <Text>
              {data.place}, {tanggal(data.issued_at)}
            </Text>
            <Text>Kepala Sekolah {data.school_name}</Text>
            <View style={s.ruangTtd} />
            <Text style={s.namaTtd}>{data.headmaster}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default LetterPdf;
