import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

const SCHOOL_URL = "https://bojanaislamicprimary.sch.id";

const SOCIALS = [
  {
    icon: IconBrandInstagram,
    label: "Instagram",
    url: "https://www.instagram.com/bojanatirtaislamicschool",
  },
  {
    icon: IconBrandFacebook,
    label: "Facebook",
    url: "https://www.facebook.com/sdislambojanatirta",
  },
  {
    icon: IconBrandYoutube,
    label: "YouTube",
    url: "https://www.youtube.com/@BojanaTirtaIslamicSchool",
  },
  {
    icon: IconBrandTiktok,
    label: "TikTok",
    url: "https://www.tiktok.com/@bojanatirtaislamicschool",
  },
];

function Footer() {
  return (
    <footer className="mt-16 bg-navy-soft text-white">
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <img
            src="/images/borderless-logo.png"
            alt="Bojana Tirta Islamic School"
            className="h-14 w-auto brightness-0 invert"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85">
            Nurturing a Qurani generation with noble character, strong academics,
            and independence through holistic education.
          </p>
        </div>

        <div>
          <p className="mb-4 font-semibold">Site</p>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-white/85">
            {["About Us", "Academic", "Programs", "News"].map((item) => (
              <li key={item}>
                <a
                  href={SCHOOL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/85 no-underline transition hover:text-primary"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-semibold">Admission</p>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-white/85">
            <li>
              <Link
                to="/register"
                className="text-white/85 no-underline transition hover:text-primary"
              >
                Register Now
              </Link>
            </li>
            <li>
              <Link
                to="/check-status"
                className="text-white/85 no-underline transition hover:text-primary"
              >
                Check Status
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-semibold">Contact Us</p>
          <ul className="m-0 list-none space-y-3 p-0 text-sm text-white/85">
            <li className="flex gap-2">
              <IconMail size={18} className="mt-0.5 shrink-0" />
              <span>btisprimary@gmail.com</span>
            </li>
            <li className="flex gap-2">
              <IconPhone size={18} className="mt-0.5 shrink-0" />
              <span>+62-811-375-566
            </span>
            </li>
          </ul>


          <div className="mt-4 flex gap-3">
            {SOCIALS.map(({ icon: Icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="rounded-lg bg-white/10 p-2 text-white no-underline transition hover:bg-primary"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app pb-12">
        <p className="mb-3 flex items-center gap-2 font-semibold">
          <IconMapPin size={18} className="shrink-0" />
          Our Location
        </p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.442101607488!2d106.87408011074042!3d-6.2052669937566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f51eca29e14b%3A0x4c636ed319acafc0!2sBojana%20Tirta%20Islamic%20School!5e0!3m2!1sid!2sid!4v1786597029204!5m2!1sid!2sid"
          title="Bojana Tirta Islamic School — Jl. Bujana Tirta Raya No.3A, Pisangan Timur, Kec. Pulo Gadung, Jakarta Timur 13230"
          className="h-72 w-full rounded-2xl border-0 sm:h-80"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/75">
        &copy; {new Date().getFullYear()} Bojana Tirta Islamic School
      </div>
    </footer>
  );
}

export default Footer;
