"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSessionStore } from "@/stores/useSessionStore";

export default function RootPage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);

  useEffect(() => {
    router.replace(user ? "/dashboard" : "/login");
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="جاري التحميل" />
    </div>
  );
}
