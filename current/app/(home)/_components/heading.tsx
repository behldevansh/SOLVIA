"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useConvexAuth } from "convex/react";
import { SignInButton } from "@clerk/clerk-react";
import Link from "next/link";
import { Spinner } from "@/components/spinner";

const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4 relative z-10">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Sunlit Intelligence, Powered by ML Precision
        <div>
          Welcome to <span className="underline">SOLVIA</span>
        </div>
      </h1>

      <h2 className="text-base sm:text-xl md:text-2xl font-medium">
        Solar Optimization via Learning-driven Visual Intelligent Analytics 
      </h2>

      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Transforming solar panel care with ML-driven insights, <br />
        ensuring efficiency and sustainability with every sunbeam.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/ML">
            <span>Enter SOLVIA</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Join SOLVIA
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};

export default Heading;
