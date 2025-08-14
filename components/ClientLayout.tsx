'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { AuthProvider } from '@/lib/useAuth';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/meeting');

  return (
    <AuthProvider>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </AuthProvider>
  );
}
