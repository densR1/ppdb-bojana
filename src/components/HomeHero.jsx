import { Link } from "react-router-dom";

function HomeHero({ isOpen, period }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-72 top-1/2 hidden h-[46rem] w-[46rem] -translate-y-1/2 rounded-full border-[5rem] border-white/[0.07] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 hidden h-[30rem] w-[30rem] -translate-y-1/2 rounded-full border-[4rem] border-white/[0.07] lg:block"
      />

      <div className="container-app relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div className="text-white">

          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Join the
            <br />
            <span className="text-primary">BTIS</span> Family
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
            Start your child&apos;s journey at a school that balances academic
            excellence with noble character and Qurani values.
          </p>

          <div className="mt-8">
            <Link to="/register" className="no-underline">
              <button className="btn-primary" disabled={!isOpen}>
                Start Your Journey
              </button>
            </Link>
          </div>

        </div>

        <div className="relative hidden justify-center self-end lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-end gap-5"
          >
            <div className="h-52 w-36 rounded-[2rem] bg-primary xl:h-60 xl:w-40" />
            <div className="h-64 w-40 rounded-[2rem] bg-primary xl:h-72 xl:w-44" />
          </div>

          {/* -mb-20 cancels the section's bottom padding so the illustration
              stands on the edge instead of floating in the middle. */}
          <img
            src="/images/main-icon.png"
            alt=""
            className="relative -mb-20 h-[24rem] w-auto object-contain drop-shadow-2xl xl:h-[28rem]"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
