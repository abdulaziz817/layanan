import { useEffect } from "react";
import { useRouter } from "next/router";
import { getUser } from "@/lib/session";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
    }
  }, []);

  return children;
}