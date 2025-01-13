import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import VenuesManagement from '@/components/dashboard/admin/venues/VenuesManagement'

export default async function ManageVenuesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: venues } = await supabase
    .from('venues')
    .select(`
      *,
      profiles:store_id (
        id,
        first_name,
        last_name,
        email,
        phone_number,
        profile_image_url
      )
    `)
    .order('created_at', { ascending: false })

    console.log(venues)

  return (
    <div>
      <VenuesManagement initialVenues={venues || []} />
    </div>
  )
}