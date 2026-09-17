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

// Helvetica bawaan tidak punya ketebalan semi-bold.
Font.register({
  family: "Poppins SemiBold",
  src: "/font/Poppins/Poppins-SemiBold.ttf",
});

// Rincian lebih dari ini pindah ke kolom kanan supaya kwitansi tetap satu halaman.
const POS_PER_KOLOM = 5;

const rupiah = (nilai) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(nilai ?? 0)}`;

const s = StyleSheet.create({
  page: { padding: 18, fontSize: 9, fontFamily: "Helvetica" },
  lembar: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 14,
    position: "relative",
  },
  capAir: {
    position: "absolute",
    top: 90,
    left: 180,
    width: 160,
    height: 160,
    objectFit: "contain",
    opacity: 0.1,
  },
  kop: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 8,
  },
  logo: { width: 46, height: 46, objectFit: "contain", marginRight: 12 },
  kopTeks: { flexGrow: 1, textAlign: "center" },
  sekolah: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  alamat: { fontSize: 7, marginTop: 2 },

  baris: { flexDirection: "row", marginTop: 5 },
  label: { width: 92, fontFamily: "Helvetica-Bold" },
  titik: { width: 8 },
  isi: { flexGrow: 1 },
  nomor: { fontFamily: "Helvetica-Bold", textAlign: "right" },
  terbilang: {
    fontFamily: "Helvetica-Oblique",
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 3,
    paddingVertical: 1,
  },

  bagian: { marginTop: 12 },
  tebal: { fontFamily: "Helvetica-Bold" },
  // Poppins berjarak baris lebih lega dari Helvetica; dirapatkan supaya tetap satu halaman.
  pos: {
    marginTop: 1,
    marginLeft: 10,
    fontFamily: "Poppins SemiBold",
    fontSize: 8.5,
    lineHeight: 1.25,
  },
  kolomPos: { flexDirection: "row" },
  kolom: { width: 220 },

  kaki: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },
  kotak: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  nominal: { fontSize: 13, fontFamily: "Helvetica-Bold", marginLeft: 12 },
  // Logo sekolah mengambil 30% lebar, stempel dan tanda tangan sisanya.
  pengesahan: { flexDirection: "row", alignItems: "center", width: 210 },
  sisiLogo: { width: "30%", alignItems: "center" },
  logoSekolah: { width: 58, height: 47, objectFit: "contain" },
  ttd: { width: "70%", alignItems: "center" },
  tumpuk: { width: 80, height: 68, position: "relative", marginTop: 2 },
  tandaTangan: { width: 80, height: 66, objectFit: "contain" },
  // Cap ditumpuk setelah tanda tangan, agak miring dan tembus seperti tinta.
  stempel: {
    position: "absolute",
    top: 8,
    left: 14,
    width: 70,
    height: 60,
    objectFit: "contain",
    opacity: 0.85,
    transform: "rotate(-8deg)",
  },
  garisTtd: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 2,
    paddingTop: 3,
    width: "95%",
    textAlign: "center",
  },
});

function Lembar({ data }) {
  return (
    <View style={s.lembar}>
      <Image style={s.capAir} src="/images/logo-primer-bojana.png" />

      <View style={s.kop}>
        <Image style={s.logo} src="/images/logo-primer-bojana.png" />
        <View style={s.kopTeks}>
          <Text style={s.sekolah}>{data.school?.name}</Text>
          <Text style={s.alamat}>{data.school?.address}</Text>
        </View>
      </View>

      <View style={s.baris}>
        <Text style={s.label}>Academic Year</Text>
        <Text style={s.titik}>:</Text>
        <Text style={s.isi}>{data.academic_year ?? "-"}</Text>
        <Text style={s.nomor}>No : {data.receipt_number ?? "-"}</Text>
      </View>
      <View style={s.baris}>
        <Text style={s.label}>Receipt from</Text>
        <Text style={s.titik}>:</Text>
        <Text style={s.isi}>{data.student_name ?? "-"}</Text>
      </View>
      <View style={s.baris}>
        <Text style={s.label}>Student ID</Text>
        <Text style={s.titik}>:</Text>
        <Text style={s.isi}>{data.registration_number ?? "-"}</Text>
      </View>
      <View style={s.baris}>
        <Text style={s.label}>Amount in Word</Text>
        <Text style={s.titik}>:</Text>
        <Text style={[s.isi, s.terbilang]}>{data.amount_in_words}</Text>
      </View>

      <View style={s.bagian}>
        <Text style={s.tebal}>{data.fee_label}</Text>
        {data.covers?.length > 0 && (
          <View>
            <Text style={{ marginTop: 3 }}>
              This payment includes the following:
            </Text>
            <View style={s.kolomPos}>
              {[
                data.covers.slice(0, POS_PER_KOLOM),
                data.covers.slice(POS_PER_KOLOM),
              ].map(
                (kolom, k) =>
                  kolom.length > 0 && (
                    <View key={k} style={s.kolom}>
                      {kolom.map((pos, i) => (
                        <Text key={pos.label} style={s.pos}>
                          {k * POS_PER_KOLOM + i + 1}. {pos.label}
                          {pos.amount > 0 ? ` : ${rupiah(pos.amount)}` : ""}
                        </Text>
                      ))}
                    </View>
                  ),
              )}
            </View>
          </View>
        )}
      </View>

      {data.note ? (
        <View style={s.bagian}>
          <Text style={s.tebal}>Note</Text>
          <Text style={{ marginTop: 2 }}>{data.note}</Text>
        </View>
      ) : null}

      <View style={s.kaki}>
        <View style={s.kotak}>
          <Text style={s.tebal}>Amount</Text>
          <Text style={s.nominal}>{rupiah(data.amount)}</Text>
        </View>

        <View style={s.pengesahan}>
          <View style={s.sisiLogo}>
            <Image style={s.logoSekolah} src="/images/logo-primer-bojana.png" />
          </View>
          <View style={s.ttd}>
            <Text>
              {data.place},{" "}
              {data.issued_at ? dayjs(data.issued_at).format("DD/MM/YYYY") : "-"}
            </Text>
            <View style={s.tumpuk}>
              <Image style={s.tandaTangan} src="/images/ttd-nurul.png" />
              <Image style={s.stempel} src="/images/lunas.png" />
            </View>
            <Text style={s.garisTtd}>{data.signatory || " "}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ReceiptPdf({ data }) {
  return (
    <Document title={`Kwitansi ${data?.receipt_number ?? ""}`}>
      <Page size="A5" orientation="landscape" style={s.page}>
        <Lembar data={data} />
      </Page>
    </Document>
  );
}

export default ReceiptPdf;
