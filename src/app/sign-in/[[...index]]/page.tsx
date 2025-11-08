'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md p-8">
        <SignIn 
          redirectUrl={redirectUrl}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "glass border-purple-500/20",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-800 border-purple-500/20 text-white hover:bg-slate-700",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
              formFieldInput: "bg-slate-800 border-purple-500/20 text-white",
              formFieldLabel: "text-slate-300",
              footerActionLink: "text-purple-400 hover:text-purple-300",
            },
          }}
        />
      </div>
    </div>
  );
}

