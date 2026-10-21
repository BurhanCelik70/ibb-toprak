'use client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CikisDugmesi() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace('/');
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full border border-[#f1c4bd] bg-white px-5 py-3 font-semibold text-[#a83422] hover:bg-[#fff5f3]"
    >
      <LogOut size={18} /> Çıkış yap
    </button>
  );
}
