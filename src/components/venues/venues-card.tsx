type VenueCardProps = {
    venue: {
      id: string
      name: string
      type: string
      description: string
      image_url: string
      location: string
    }
    onSelect: () => void
  }
  
  export function VenueCard({ venue, onSelect }: VenueCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={venue.image_url || '/placeholder.jpg'}
          alt={venue.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{venue.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{venue.location}</p>
          <p className="text-gray-500 text-sm mb-4">{venue.description}</p>
          <button
            onClick={onSelect}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Make Request
          </button>
        </div>
      </div>
    )
  }