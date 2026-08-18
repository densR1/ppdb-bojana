import { clearToken, hasToken } from "@/utils/session";
import { IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const opened = hasToken();

  // Always the lookup form, even while a token is held — reaching a
  // registration must cost the child's date of birth every time.
  const links = [
    { to: "/", label: "Home" },
    { to: "/check-status", label: "Check Status" },
  ];

  const close = () => {
    clearToken();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img
            src="/images/logo-primer-bojana.png"
            alt="Bojana Tirta Islamic School"
            className="h-9 w-auto sm:h-11"
          />
          <span className="hidden text-sm font-semibold leading-tight text-navy sm:block">
            Bojana Tirta Islamic School
            <span className="block text-xs font-normal text-slate-500">
              New Student Admission
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 no-underline transition hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}

          {opened ? (
            <button
              onClick={close}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-red-600"
            >
              <IconLogout size={18} />
              Close
            </button>
          ) : (
            <Link to="/register" className="no-underline">
              <button className="btn-primary !py-2.5 !text-sm">
                Register Now
              </button>
            </Link>
          )}
        </nav>

        <button
          className="text-slate-600 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Menu"
        >
          {open ? <IconX size={26} /> : <IconMenu2 size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-app flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-slate-700 no-underline hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}

            {opened && (
              <button
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2 py-3 text-left text-base font-medium text-red-600"
              >
                <IconLogout size={20} />
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
