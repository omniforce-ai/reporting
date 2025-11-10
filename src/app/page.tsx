import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserRole, getCurrentUserClientSlug } from '@/lib/auth/roles';

export default async function HomePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const role = await getCurrentUserRole();
  const clientSlug = await getCurrentUserClientSlug();
  
  // Redirect admins to clients page, clients to their client dashboard
  if (role === 'admin') {
    redirect('/admin/clients');
  } else if (clientSlug) {
    redirect(`/clients/${clientSlug}/dashboard`);
  } else {
    // No clientSlug - redirect to unauthorized
    redirect('/unauthorized');
  }
}

