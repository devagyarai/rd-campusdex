/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthProvider } from "@/contexts/auth-context";
import { StudentLayout } from "@/components/layout/student-layout";

export default function StudentRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StudentLayout>{children}</StudentLayout>
    </AuthProvider>
  );
}
