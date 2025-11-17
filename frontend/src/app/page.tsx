"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getUser();

      // Redirect based on user role
      if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
        router.push('/admin/dashboard');
      } else if (user?.roles?.includes('ROLE_BACK_OFFICE')) {
        router.push('/backoffice/dashboard');
      } else {
        router.push('/portal/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">E-Filing System</h1>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
