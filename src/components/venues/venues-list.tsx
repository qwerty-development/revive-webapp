'use client'

import { useState } from 'react'
import { VenueCard } from './venues-card'
import { RequestForm} from './request-form'

type Venue = {
  id: string
  name: string
  type: string
  description: string
  image_url: string
  location: string
}

export default function VenuesList({ venues }: { venues: Venue[] }) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  return (
    <div>
      {selectedVenue ? (
        <RequestForm venue={selectedVenue} onBack={() => setSelectedVenue(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onSelect={() => setSelectedVenue(venue)}
            />
          ))}
        </div>
      )}
    </div>
  )
}