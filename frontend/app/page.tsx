// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasValidTokens } from "@/lib/token";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Хэрэв нэвтэрсэн бол dashboard руу, үгүй бол login руу
    if (hasValidTokens()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
