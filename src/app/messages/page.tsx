'use client';

import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';
import MessagesContent from './MessagesContent';

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container px-4 mx-auto py-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <MessagesContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
