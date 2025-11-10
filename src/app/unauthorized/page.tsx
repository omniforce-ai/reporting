import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserClientSlug } from '@/lib/auth/roles';

export default async function UnauthorizedPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const clientSlug = await getCurrentUserClientSlug();
  
  if (clientSlug) {
    redirect(`/clients/${clientSlug}/dashboard`);
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">403</h1>
        <p className="text-xl text-muted-foreground mb-8">Unauthorized Access</p>
        <p className="text-muted-foreground mb-6">
          You do not have permission to access this resource.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors inline-block"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

