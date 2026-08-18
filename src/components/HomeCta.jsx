import { Link } from "react-router-dom";

function HomeCta({ isOpen, period }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-navy px-6 py-14 text-center text-white sm:px-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[3rem] border-white/[0.07]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[3.5rem] border-white/[0.07]"
      />

      <div className="relative">
        {isOpen && (
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Admission Open {period?.label}
          </span>
        )}

        <h2 className="m-0 mt-4 text-2xl font-bold leading-tight sm:text-3xl">
          Ready to join the <span className="text-primary">BTIS</span> family?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
          {isOpen
            ? "Secure your child's place for the coming school year. Start whenever you are ready — you can stop halfway and come back to finish."
            : "Registration is closed at the moment. Please check back later or contact the school."}
        </p>

        <div className="mt-8 flex justify-center">
          <Link to="/register" className="no-underline">
            <button className="btn-primary !px-10" disabled={!isOpen}>
              Register Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeCta;
