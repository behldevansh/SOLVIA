import Image from "next/image";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from "react-icons/fa";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

// Constants for contact details
const CONTACT_INFO = {
  email: "anuradha.tomar@nsut.ac.in",
  // phone: "+91 98765 43210",
  instagram: "https://www.instagram.com/nsut.official/?hl=en",
  linkedin: "https://in.linkedin.com/company/officialnsut",
};

const Footer = () => {
  return (
    <footer className="pb-4">
      <hr className="border-gray-800 dark:border-gray-700 mb-4" />
      <div className="container mx-auto px-4 flex flex-wrap md:flex-none justify-center md:justify-between items-center gap-4 me:gap-6">
        {/* Left - Logos */}
        <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
          <Link href="http://www.nsut.ac.in/en/home" aria-label="NSUT">
            <Image
              src="/logo1.png"
              height="60"
              width="60"
              alt="NSUT Logo"
              className="dark:hidden"
            />
            <Image
              src="/logo2.png"
              height="60"
              width="60"
              alt="NSUT Logo"
              className="hidden dark:block"
            />
          </Link>

          <Link href="https://www.iitk.ac.in/" aria-label="IITK">
            <Image
              src="/iitk1.png"
              height="60"
              width="60"
              alt="Logo"
              className="dark:hidden"
            />
            <Image
              src="/iitk2.png"
              height="60"
              width="60"
              alt="Logo"
              className="hidden dark:block"
            />
          </Link>
          <Link
            href="https://airquality.cpcb.gov.in/ccr/#/caaqm-dashboard-all/caaqm-landing"
            aria-label="NSUT"
          >
            <Image
              src="/ai4c.png"
              height="60"
              width="60"
              alt="Logo"
              className="dark:invert"
            />
          </Link>
        </div>

        {/* Right - Contact Details */}
        <div className="flex gap-4 text-sm mt-6 md:mt-0 items-center">
          <Link
            href={`mailto:${CONTACT_INFO.email}`}
            className="hover:text-blue-400 transition"
          >
            <FaEnvelope size={20} className="inline-block me-4" />
            {CONTACT_INFO.email}
          </Link>

          {/* <Link
            href={`tel:${CONTACT_INFO.phone}`}
            className="hover:text-blue-400 transition"
          >
            <FaPhone size={20} className="inline-block me-4" />
            {CONTACT_INFO.phone}
          </Link> */}

          <Link
            href={CONTACT_INFO.instagram}
            target="_blank"
            aria-label="Instagram"
            className="hover:text-pink-500 transition"
          >
            <FaInstagram size={32} className="inline-block" />
          </Link>

          <Link
            href={CONTACT_INFO.linkedin}
            target="_blank"
            aria-label="LinkedIn"
            className="hover:text-blue-500 transition"
          >
            <FaLinkedin size={32} className="inline-block" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
