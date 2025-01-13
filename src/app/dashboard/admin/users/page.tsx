// app/dashboard/admin/users/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import UsersManagement from '@/components/dashboard/admin/users/UsersManagement'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'

export default async function UsersPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      role,
      profile_image_url,
      created_at
    `)
    .order('created_at', { ascending: false })

  return <UsersManagement initialUsers={users || []} />
}