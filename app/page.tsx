"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Jasmin SMS Gateway Management
          </h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block"
          >
            <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={"https://rbsoft.org/downloads/sms-gateway/images/screenshots/dashboard.png"}
                alt="Jasmin SMS Gateway Management"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Manage Your SMS Gateway
                </h2>
                <p className="text-white/90 text-lg">
                  A comprehensive web interface for Jasmin SMS Gateway CLI management
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sign in to your account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Enter your credentials to access the dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input pr-10"
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-error">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Sign in
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    <span className="flex items-center justify-center gap-1 mt-2">
                      <UserPlus size={16} />
                      Register now
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Jasmin SMS Gateway Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}