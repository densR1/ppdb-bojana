import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

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
  pos: { marginTop: 2, marginLeft: 10 },

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
  ttd: { alignItems: "center", width: 165 },
  lunas: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#c00000",
    letterSpacing: 2,
  },
  garisTtd: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 22,
    paddingTop: 3,
    width: 150,
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
            {data.covers.map((pos, i) => (
              <Text key={pos.label} style={s.pos}>
                {i + 1}. {pos.label}
                {pos.amount > 0 ? ` : ${rupiah(pos.amount)}` : ""}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={s.kaki}>
        <View style={s.kotak}>
          <Text style={s.tebal}>Amount</Text>
          <Text style={s.nominal}>{rupiah(data.amount)}</Text>
        </View>

        <View style={s.ttd}>
          <Text style={s.lunas}>LUNAS</Text>
          <Text style={{ marginTop: 3 }}>
            {data.place},{" "}
            {data.issued_at ? dayjs(data.issued_at).format("DD/MM/YYYY") : "-"}
          </Text>
          <Text style={s.garisTtd}>{data.signatory || " "}</Text>
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
