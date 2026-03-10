'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TeenagerRegisterForm } from '@/components/auth/teenager-register-form';
import { EmployerRegisterForm } from '@/components/auth/employer-register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRound, Building2 } from 'lucide-react';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  const initialRole = useMemo(() => {
    const role = searchParams.get('role');
    return (role === 'TEENAGER' || role === 'EMPLOYER') ? role : 'TEENAGER';
  }, [searchParams]);
  
  const [selectedRole, setSelectedRole] = useState<'TEENAGER' | 'EMPLOYER'>(initialRole);
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirect only if already authenticated and not in the middle of registration
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isRegistering) {
      router.push(selectedRole === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard');
    }
  }, [isAuthenticated, isLoading, router, selectedRole, isRegistering]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render form if authenticated (will redirect)
  if (isAuthenticated && !isRegistering) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>
              Выберите тип аккаунта для продолжения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as 'TEENAGER' | 'EMPLOYER')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="TEENAGER" className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Я подросток
                </TabsTrigger>
                <TabsTrigger value="EMPLOYER" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Я работодатель
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="TEENAGER">
                <TeenagerRegisterForm onRegisteringChange={setIsRegistering} />
              </TabsContent>
              
              <TabsContent value="EMPLOYER">
                <EmployerRegisterForm onRegisteringChange={setIsRegistering} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
