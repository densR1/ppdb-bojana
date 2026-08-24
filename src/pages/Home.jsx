import Alert from "@/components/Alert";
import HomeCta from "@/components/HomeCta";
import HomeHero from "@/components/HomeHero";
import Shell from "@/components/Shell";
import { errorMessage, request } from "@/utils/request";
import {
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

        <section>
          <h2 className="section-title">Required Documents</h2>
          <p className="section-subtitle">
            Prepared once your child passes the psychotest — no need to bring
            anything on the first day
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-primary hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <doc.icon size={24} />
                </span>
                <p className="m-0 mt-4 font-semibold text-navy">{doc.title}</p>
                <p className="m-0 mt-1 text-sm text-slate-500">{doc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <HomeCta isOpen={isOpen} period={period} />
      </div>
    </Shell>
  );
}

export default Home;
