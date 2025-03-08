import Image from "next/image";
import { Poppins } from "next/font/google";
import { Button } from '@/components/ui/button';

import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"]
});

export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
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
      <Button  size="sm">Helios Haven</Button>
    </div>
  )
}