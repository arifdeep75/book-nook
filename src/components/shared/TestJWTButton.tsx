
"use client";

import { authClient } from "@/lib/auth-client";

export default function TestJWTButton() {
  const testJWT = async () => {
    const { data, error } = await authClient.token();

    if (error) {
      console.error("JWT error:", error);
      alert("JWT পাওয়া যায়নি। Login করা আছে কি না দেখো।");
      return;
    }

    if (data?.token) {
      console.log("JWT successfully received!");
      alert("JWT successfully received!");
    } else {
      console.error("Token missing:", data);
      alert("Token পাওয়া যায়নি।");
    }
  };

  return (
    <button
      onClick={testJWT}
      className="mt-5 rounded-lg bg-[#D6B878] px-5 py-2 text-sm font-semibold text-[#1c352b] transition hover:bg-white"
    >
      Test JWT
    </button>
  );
}
