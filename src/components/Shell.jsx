import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";

/**
 * Page frame. `narrow` keeps forms and status pages from stretching on wide
 * screens; the landing page opts out and uses the full width.
 */
function Shell({ title, subtitle, backTo, narrow = true, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {title && (
          <div className="border-b border-slate-200 bg-white">
            <div className="container-app py-6 sm:py-8">
              {backTo && (
                <Link
                  to={backTo}
                  className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 no-underline transition hover:text-secondary"
                >
                  <IconArrowLeft size={18} />
                  Back
                </Link>
              )}
              <h1 className="m-0 text-2xl font-bold text-navy sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="m-0 mt-1 text-sm text-slate-500 sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        <div className={narrow ? "container-app max-w-2xl space-y-5 py-8" : ""}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Shell;
