import React from "react";
import Image from "next/image";

const Heroes = () => {
  return (
    <div className="flex flex-col justify-center items-center max-w-7xl mx-auto relative z-1 -mt-20">
      <div className="relative flex justify-center w-[400px] h-[500px] sm:w-[600px] sm:h-[600px] md:w-[700px] md:h-[700px]">
        {/* Light Mode Image */}
        <Image
          src="/back1.jpg"
          fill
          className="object-contain dark:hidden"
          alt="Light Mode Image"
        />
        {/* Dark Mode Image */}
        <Image
          src="/back2.png"
          fill
          className="object-contain hidden dark:block"
          alt="Dark Mode Image"
        />
      </div>
    </div>
  );
};

export default Heroes;
