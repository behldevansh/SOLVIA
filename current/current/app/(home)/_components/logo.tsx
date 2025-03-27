import Image from "next/image";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import Link from "next/link";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
      <Link href="http://www.nsut.ac.in/en/home" aria-label="NSUT">
        <Image
          src="/logo1.png"
          height="60"
          width="60"
          alt="Logo"
          className="dark:hidden"
        />
        <Image
          src="/logo2.png"
          height="60"
          width="60"
          alt="Logo"
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
      <Link href="https://airquality.cpcb.gov.in/ccr/#/caaqm-dashboard-all/caaqm-landing" aria-label="NSUT">
        <Image
          src="/ai4c.png"
          height="60"
          width="60"
          alt="Logo"
          className="dark:invert"
        />
      </Link>
    </div>
  );
};
