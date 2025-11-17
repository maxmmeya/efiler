"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/lib/auth";
import { toast } from "sonner";
import Link from "next/link";
import { ForcedPasswordChange } from "@/components/forced-password-change";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForcedPasswordChange, setShowForcedPasswordChange] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      // Check if user must change password
      if (response.mustChangePassword) {
        toast.info("Please change your password to continue");
        setShowForcedPasswordChange(true);
        setIsLoading(false);
        return;
      }

      toast.success("Login successful!");

      // Redirect based on user role
      if (response.roles.includes('ROLE_ADMINISTRATOR')) {
        router.push('/admin/dashboard');
      } else if (response.roles.includes('ROLE_BACK_OFFICE')) {
        router.push('/backoffice/dashboard');
      } else {
        router.push('/portal/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowForcedPasswordChange(false);
    toast.success("Password changed successfully! Redirecting...");

    // Get updated user and redirect
    const user = authService.getUser();
    if (user) {
      if (user.roles.includes('ROLE_ADMINISTRATOR')) {
        router.push('/admin/dashboard');
      } else if (user.roles.includes('ROLE_BACK_OFFICE')) {
        router.push('/backoffice/dashboard');
      } else {
        router.push('/portal/dashboard');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">E-Filing System</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              {...register("username")}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>

      {showForcedPasswordChange && (
        <ForcedPasswordChange onSuccess={handlePasswordChangeSuccess} />
      )}
    </div>
  );
}
