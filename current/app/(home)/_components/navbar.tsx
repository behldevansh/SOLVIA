"use client";

import { useScrollTop } from '@/hooks/use-scroll-top';
import {cn} from '@/lib/utils';
import React from 'react'
import { Logo } from './logo';
import { ModeToggle } from '@/components/mode-toggle';
import { useConvexAuth } from 'convex/react';
import { SignInButton, UserButton} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation'

const navbar = () => {
    const {isAuthenticated,isLoading} = useConvexAuth();
    const scrolled = useScrollTop();
    const {pathname} = usePathname();
  return (
    <div className={cn(
        "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
      scrolled && "border-b shadow-sm"
    )}>
        <Logo/>
        <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
          {isLoading && (
            <Spinner/>
          )}
          {!isAuthenticated && !isLoading && (
            <>
            <SignInButton mode='modal'>
              <Button size="sm">Log In</Button>
            </SignInButton>
            </>
          )}
          {isAuthenticated && !isLoading && (
          <>
            <Button variant="secondary" size="sm" asChild>
             {
                pathname === '/ML' ? (
                  <Link href="/">
                    <span>Home</span>
                  </Link>
                ) : (
                  <Link href="/ML">
                    <span>ML</span>
                  </Link>
                )
             }
            </Button>
            <UserButton
              afterSignOutUrl="/"
            />
          </>
        )}
        <ModeToggle/>
        </div>
      
    </div>
  )
}

export default navbar
