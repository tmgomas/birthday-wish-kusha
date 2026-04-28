'use client';
import dynamic from 'next/dynamic';

// Disable SSR entirely — eliminates all hydration mismatches from browser extensions
const BirthdayContent = dynamic(() => import('./BirthdayContent'), { ssr: false });

export default function Page() {
  return <BirthdayContent />;
}
