import Alert from "@/components/Alert";
import HomeCta from "@/components/HomeCta";
import HomeHero from "@/components/HomeHero";
import Shell from "@/components/Shell";
import { rupiah } from "@/utils/format";
import { errorMessage, request } from "@/utils/request";
import {
  IconCash,
  IconClipboardCheck,
  IconClipboardList,
  IconFileText,
  IconId,
  IconPhoto,
  IconSchool,
  IconUsers,
} 
from "@tabler/icons-react";
import { useEffect, useState } from "react";

const STEPS = [
  {
    icon: IconClipboardList,
    title: "Registration",
    desc: "Fill in your child's details",
  },
  { icon: IconSchool, title: "Psychotest", desc: "Schedule sent to your email" },
  { icon: IconClipboardCheck, title: "Result", desc: "Announced by email" },
  {
    icon: IconFileText,
    title: "Re-register",
    desc: "Pay and complete documents",
  },
];

const DOCUMENTS = [
  { icon: IconId, title: "Birth Certificate", desc: "Copy of the certificate" },
  { icon: IconUsers, title: "Family Card", desc: "Latest copy" },
  { icon: IconSchool, title: "Kindergarten Report", desc: "If available" },
  { icon: IconPhoto, title: "Photograph", desc: "Recent photo of your child" },
];

function Home() {
  const [period, setPeriod] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const response = await request({ url: "/v1/ppdb/active-period" });
        setPeriod(response.data.data.admission_period);
        setIsOpen(response.data.data.is_open);
      } catch (err) {
        setError(errorMessage(err, "Failed to load admission data"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Shell narrow={false}>
      <HomeHero isOpen={isOpen} period={period} />

      <div className="container-app space-y-14 py-14">
        {error && <Alert type="error">{error}</Alert>}

        {!loading && !isOpen && (
          <Alert type="warning" title="Admission is currently closed">
            Please check back later or contact the school.
          </Alert>
        )}

        <section>
          <h2 className="section-title">Simple Admission Process</h2>
          <p className="section-subtitle">
            Four steps from applying to becoming part of the BTIS family
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {/* Garis penghubung ditarik dari ikon ke ikon berikutnya, jadi
                    hanya digambar kalau kolom sesudahnya ada di baris yang sama. */}
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-7 hidden h-0.5 w-full bg-secondary/20 lg:block"
                  />
                )}

                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-secondary/20 bg-white text-secondary">
                  <step.icon size={26} />
                </div>
                <p className="m-0 mt-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </p>
                <p className="m-0 mt-0.5 font-semibold text-navy">
                  {step.title}
                </p>
                <p className="m-0 mt-1 text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <IconFileText size={22} />
              </span>
              <h3 className="m-0 text-lg font-bold text-navy">
                Required Documents
              </h3>
            </div>
            <p className="m-0 mt-2 text-sm text-slate-500">
              Uploaded after your child passes the psychotest.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {DOCUMENTS.map((doc) => (
                <div
                  key={doc.title}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <doc.icon size={20} className="mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-semibold text-navy">
                      {doc.title}
                    </p>
                    <p className="m-0 text-xs text-slate-500">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconCash size={22} />
              </span>
              <h3 className="m-0 text-lg font-bold text-navy">School Fees</h3>
            </div>
            <p className="m-0 mt-2 text-sm text-slate-500">
              Paid in stages. Bank details appear on your invoice page.
            </p>

            <div className="mt-5 space-y-3">
              {period?.requires_psychotest && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-600">
                    Psychotest Fee
                  </span>
                  <span className="font-bold text-secondary">
                    {rupiah(period.psychotest_fee)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Registration Fee
                </span>
                <span className="font-bold text-secondary">
                  {rupiah(period?.registration_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Monthly Tuition
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  Contact the school
                </span>
              </div>
            </div>
          </div>
        </section>

        <HomeCta isOpen={isOpen} period={period} />
      </div>
    </Shell>
  );
}

export default Home;
