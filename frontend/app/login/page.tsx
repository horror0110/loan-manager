"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogIn } from "lucide-react";

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = `https://zeel.website/api/auth/google`;
  };
  [];
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[360px] shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">Нэвтрэх</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <p className="text-gray-500 text-center text-sm">
            Google-р нэвтэрч системд хандах
          </p>

          <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center gap-2"
            variant="default"
          >
            <LogIn className="w-4 h-4" />
            Google-р нэвтрэх
          </Button>

          <Separator />

          <p className="text-center text-xs text-gray-400">
            Loan Manager © {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
