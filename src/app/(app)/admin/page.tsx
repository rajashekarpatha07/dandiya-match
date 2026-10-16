"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { PageSpinner } from "@/components/Spinner";
import {
  useIsAdmin,
  useAdminVenues,
  useCreateVenue,
  useUpdateVenue,
  useDeleteVenue,
  useAdminVenueEvents,
  useCreateVenueEvent,
  useDeleteVenueEvent,
} from "@/lib/queries/admin";
import type { Venue } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const isAdminQ = useIsAdmin();
  const venuesQ = useAdminVenues();
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [managingEventsFor, setManagingEventsFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check admin access
  if (isAdminQ.isLoading) return <PageSpinner />;
  if (isAdminQ.isError || !isAdminQ.data) {
    return (
      <main className="mx-auto max-w-4xl p-5">
        <EmptyState
          title="Access Denied"
          body="You don't have permission to access this page."
        />
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </main>
    );
  }

  if (venuesQ.isLoading) return <PageSpinner />;
  if (venuesQ.isError) {
    return (
      <main className="mx-auto max-w-4xl p-5">
        <ErrorState onRetry={() => void venuesQ.refetch()} />
      </main>
    );
  }

  const venues = venuesQ.data ?? [];

  return (
    <main className="mx-auto max-w-4xl p-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-red">Admin - Venue Management</h1>
        <Button
          onClick={() => {
            setEditingVenue(null);
            setShowVenueForm(true);
            setManagingEventsFor(null);
          }}
        >
          + Add Venue
        </Button>
      </div>

      {showVenueForm || editingVenue ? (
        <VenueForm
          venue={editingVenue}
          onClose={() => {
            setShowVenueForm(false);
            setEditingVenue(null);
          }}
          onSuccess={(message) => {
            setToast({ message, type: "success" });
            setShowVenueForm(false);
            setEditingVenue(null);
          }}
          onError={(message) => setToast({ message, type: "error" })}
        />
      ) : managingEventsFor ? (
        <EventsManager
          venueId={managingEventsFor}
          venueName={venues.find((v) => v.id === managingEventsFor)?.name ?? ""}
          onClose={() => setManagingEventsFor(null)}
          onSuccess={(message) => setToast({ message, type: "success" })}
          onError={(message) => setToast({ message, type: "error" })}
        />
      ) : venues.length === 0 ? (
        <EmptyState
          title="No venues yet"
          body="Click 'Add Venue' to create your first venue."
        />
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onEdit={() => setEditingVenue(venue)}
              onManageEvents={() => setManagingEventsFor(venue.id)}
              onDeleted={(message) => setToast({ message, type: "success" })}
              onError={(message) => setToast({ message, type: "error" })}
            />
          ))}
        </div>
      )}

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl border px-6 py-3 shadow-lg ${
            toast.type === "success"
              ? "border-orange bg-orange text-white"
              : "border-red bg-red text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 font-bold hover:opacity-80"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function VenueCard({
  venue,
  onEdit,
  onManageEvents,
  onDeleted,
  onError,
}: {
  venue: Venue;
  onEdit: () => void;
  onManageEvents: () => void;
  onDeleted: (message: string) => void;
  onError: (message: string) => void;
}) {
  const deleteMutation = useDeleteVenue();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(venue.id);
      onDeleted("Venue deleted successfully");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete venue");
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display text-xl text-red">{venue.name}</h3>
          {venue.area && <p className="text-sm text-muted">{venue.area}</p>}
          {venue.address && <p className="mt-1 text-sm">{venue.address}</p>}
          {venue.description && (
            <p className="mt-2 text-sm text-muted">{venue.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-orange/10 px-3 py-1 text-orange">
              Entry: ₹{venue.entry_fee ?? 0}
            </span>
            <span className={`rounded-full px-3 py-1 ${venue.is_active ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}`}>
              {venue.is_active ? "Active" : "Inactive"}
            </span>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-600">
              {venue.lat.toFixed(4)}, {venue.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onManageEvents} className="flex-1">
          Manage Events
        </Button>
        <Button variant="secondary" onClick={onEdit} className="flex-1">
          Edit
        </Button>
        {confirmDelete ? (
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="danger"
            onClick={() => setConfirmDelete(true)}
            className="flex-1"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

function VenueForm({
  venue,
  onClose,
  onSuccess,
  onError,
}: {
  venue: Venue | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const createMutation = useCreateVenue();
  const updateMutation = useUpdateVenue();
  const createEventMutation = useCreateVenueEvent();
  const [formData, setFormData] = useState({
    name: venue?.name ?? "",
    description: venue?.description ?? "",
    address: venue?.address ?? "",
    area: venue?.area ?? "",
    lat: venue?.lat.toString() ?? "",
    lng: venue?.lng.toString() ?? "",
    entry_fee: venue?.entry_fee?.toString() ?? "",
    image_url: venue?.image_url ?? "",
    is_active: venue?.is_active ?? true,
  });
  const [addFirstEvent, setAddFirstEvent] = useState(false);
  const [eventData, setEventData] = useState({
    event_date: "",
    start_time: "",
    end_time: "",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocode address to get lat/lng
  const handleGeocodeAddress = async () => {
    const addressQuery = [formData.name, formData.address, formData.area, "Kamareddy, Telangana, India"]
      .filter(Boolean)
      .join(", ");

    if (!addressQuery.trim()) {
      onError("Please enter at least a venue name or address to geocode");
      return;
    }

    setIsGeocoding(true);
    try {
      // Use Nominatim (OpenStreetMap) geocoding service - free, no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`,
        {
          headers: {
            "User-Agent": "DandiyaMatch/1.0", // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData({
          ...formData,
          lat: parseFloat(lat).toFixed(6),
          lng: parseFloat(lon).toFixed(6),
        });
        onSuccess(`Location found: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`);
      } else {
        onError("Location not found. Please enter coordinates manually or try a more specific address.");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to geocode address");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || isNaN(lng)) {
      onError("Please provide valid latitude and longitude");
      return;
    }

    if (addFirstEvent && !eventData.event_date) {
      onError("Please provide an event date or uncheck 'Add first event'");
      return;
    }

    const venueData = {
      name: formData.name,
      description: formData.description || null,
      address: formData.address || null,
      area: formData.area || null,
      lat,
      lng,
      entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    try {
      if (venue) {
        await updateMutation.mutateAsync({ id: venue.id, updates: venueData });
        onSuccess("Venue updated successfully");
      } else {
        // Create venue first
        const newVenue = await createMutation.mutateAsync(venueData);
        
        // If user wants to add first event, create it
        if (addFirstEvent && eventData.event_date) {
          try {
            await createEventMutation.mutateAsync({
              venue_id: newVenue.id,
              event_date: eventData.event_date,
              start_time: eventData.start_time || null,
              end_time: eventData.end_time || null,
            });
            onSuccess("Venue and first event created successfully");
          } catch (eventError) {
            // Venue was created but event failed
            onSuccess("Venue created, but failed to add event. You can add it from 'Manage Events'");
          }
        } else {
          onSuccess("Venue created successfully");
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to save venue");
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="font-display mb-4 text-2xl text-red">
        {venue ? "Edit Venue" : "Add New Venue"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Area</label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
            placeholder="Full address for geocoding"
          />
        </div>

        <div className="rounded-xl border-2 border-orange/30 bg-orange/5 p-4">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xl">📍</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange">Auto-fill Location</p>
              <p className="text-xs text-muted mt-1">
                Click the button below to automatically get coordinates from the address above
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleGeocodeAddress}
            disabled={isGeocoding}
            variant="secondary"
            className="w-full"
          >
            {isGeocoding ? "Finding location..." : "📍 Get Coordinates from Address"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Latitude *</label>
            <input
              type="number"
              step="any"
              required
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
              placeholder="Auto-filled"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Longitude *</label>
            <input
              type="number"
              step="any"
              required
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
              placeholder="Auto-filled"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Entry Fee (₹)</label>
          <input
            type="number"
            step="any"
            value={formData.entry_fee}
            onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2 text-sm focus:border-orange focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-line text-orange focus:ring-orange"
          />
          <label htmlFor="is_active" className="text-sm font-semibold">
            Active (visible to users)
          </label>
        </div>

        {!venue && (
          <>
            <div className="border-t border-line pt-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add_first_event"
                  checked={addFirstEvent}
                  onChange={(e) => setAddFirstEvent(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-orange focus:ring-orange"
                />
                <label htmlFor="add_first_event" className="text-sm font-semibold">
                  Add first event date (optional)
                </label>
              </div>

              {addFirstEvent && (
                <div className="space-y-3 rounded-xl border border-line bg-background p-4">
                  <div>
                    <label className="block text-sm font-semibold">Event Date *</label>
                    <input
                      type="date"
                      required={addFirstEvent}
                      value={eventData.event_date}
                      onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm focus:border-orange focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold">Start Time</label>
                      <input
                        type="time"
                        value={eventData.start_time}
                        onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm focus:border-orange focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold">End Time</label>
                      <input
                        type="time"
                        value={eventData.end_time}
                        onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm focus:border-orange focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending || createEventMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending || updateMutation.isPending || createEventMutation.isPending
              ? "Saving..."
              : venue
                ? "Update Venue"
                : "Create Venue"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function EventsManager({
  venueId,
  venueName,
  onClose,
  onSuccess,
  onError,
}: {
  venueId: string;
  venueName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const eventsQ = useAdminVenueEvents(venueId);
  const createMutation = useCreateVenueEvent();
  const deleteMutation = useDeleteVenueEvent();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    event_date: "",
    start_time: "",
    end_time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        venue_id: venueId,
        event_date: formData.event_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
      });
      onSuccess("Event created successfully");
      setFormData({ event_date: "", start_time: "", end_time: "" });
      setShowForm(false);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to create event");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This will also delete all associated partner listings and requests.")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: eventId, venueId });
      onSuccess("Event deleted successfully");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete event");
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-red">Manage Events</h2>
          <p className="text-sm text-muted">{venueName}</p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          ← Back
        </Button>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-4 w-full">
          + Add Event Date
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border border-line bg-background p-4">
          <div>
            <label className="block text-sm font-semibold">Event Date *</label>
            <input
              type="date"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm focus:border-orange focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm focus:border-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm focus:border-orange focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? "Adding..." : "Add Event"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setFormData({ event_date: "", start_time: "", end_time: "" });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {eventsQ.isLoading ? (
        <PageSpinner />
      ) : eventsQ.isError ? (
        <ErrorState onRetry={() => void eventsQ.refetch()} />
      ) : !eventsQ.data || eventsQ.data.length === 0 ? (
        <EmptyState title="No events" body="Add event dates for this venue." />
      ) : (
        <div className="space-y-2">
          {eventsQ.data.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-line bg-background p-3"
            >
              <div>
                <p className="font-semibold">{event.event_date}</p>
                {(event.start_time || event.end_time) && (
                  <p className="text-xs text-muted">
                    {event.start_time ?? ""} {event.end_time ? `– ${event.end_time}` : ""}
                  </p>
                )}
              </div>
              <Button
                variant="danger"
                onClick={() => handleDelete(event.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
