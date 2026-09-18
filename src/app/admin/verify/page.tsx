"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "loading" | "success" | "error";
    message: string;
  }>({ type: "loading", message: "Verifying your magic link..." });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus({
        type: "error",
        message: "Invalid magic link. No token provided.",
      });
      return;
    }

    async function verify() {
      try {
        const response = await fetch("/api/admin/verify-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus({
            type: "success",
            message: "Successfully signed in! Redirecting...",
          });
          setTimeout(() => {
            router.push("/admin");
          }, 1500);
        } else {
          setStatus({
            type: "error",
            message: data.error || "Failed to verify magic link",
          });
        }
      } catch (error) {
        setStatus({
          type: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    }

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {status.type === "loading" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">{status.message}</p>
              </div>
            )}

            {status.type === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-green-800">{status.message}</p>
              </div>
            )}

            {status.type === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-red-800 mb-4">{status.message}</p>
                <a
                  href="/admin/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Request a new magic link
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
