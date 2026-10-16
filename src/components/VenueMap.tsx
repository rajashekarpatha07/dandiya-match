"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { formatEntryFee } from "@/lib/utils";
import type { VenueWithStats } from "@/lib/types";

const pinIcon = L.divIcon({
  className: "venue-pin",
  html: '<div class="venue-pin-inner"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -20],
});

const KAMAREDDY: [number, number] = [18.32, 78.34];

export default function VenueMap({ venues }: { venues: VenueWithStats[] }) {
  return (
    <MapContainer
      center={KAMAREDDY}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {venues.map((venue) => (
        <Marker key={venue.id} position={[venue.lat, venue.lng]} icon={pinIcon}>
          <Popup>
            <div className="min-w-[160px] text-ink">
              <p className="font-semibold">{venue.name}</p>
              {venue.area ? (
                <p className="text-xs text-muted">{venue.area}</p>
              ) : null}
              <p className="mt-1 text-xs">{formatEntryFee(venue.entry_fee)}</p>
              {venue.openListingCount > 0 ? (
                <p className="mt-1 text-xs text-orange">
                  {venue.openListingCount} open listing
                  {venue.openListingCount === 1 ? "" : "s"}
                </p>
              ) : null}
              <Link
                href={`/venue/${venue.id}`}
                className="mt-2 inline-flex min-h-11 items-center rounded-full bg-orange px-4 text-sm font-semibold text-white"
              >
                View
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
