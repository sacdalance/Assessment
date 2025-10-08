import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Fix for default Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Event = {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
};

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: "", description: "", lat: "", lng: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setForm({ ...form, lat: lat.toFixed(6), lng: lng.toFixed(6) });
    toast.success("Coordinates selected from map!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.lat || !form.lng) return;
    
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:3001/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents([newEvent, ...events]);
        setForm({ title: "", description: "", lat: "", lng: "" });
        toast.success("Event created!");
      } else {
        toast.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-light text-black">Simple Events App</h1>
          <p className="text-gray-600 mt-2">Create and manage location-based events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-black">Create Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Event title"
                      required
                      className="border-gray-300 focus:border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Event description"
                      rows={3}
                      className="border-gray-300 focus:border-black focus:ring-0 focus:ring-offset-0 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="lat"
                        value={form.lat}
                        onChange={handleChange}
                        placeholder="0.000000"
                        type="number"
                        step="any"
                        required
                        className="border-gray-300 focus:border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="lng"
                        value={form.lng}
                        onChange={handleChange}
                        placeholder="0.000000"
                        type="number"
                        step="any"
                        required
                        className="border-gray-300 focus:border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                    </div>
                  </div>

                    <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-black text-black border-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Creating...
                      </>
                      ) : (
                      <>
                        <Plus className="mr-2 text" size={16} />
                        Create Event
                      </>
                      )}
                    </Button>
                    </div>
                </form>

                <div className="mt-4 p-3 bg-gray-50 rounded border text-sm text-gray-600">
                  <p className="font-medium mb-1">💡 Tip:</p>
                  <p>Click anywhere on the map to automatically fill coordinates</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-black flex items-center justify-between">
                  <span>Event Locations</span>
                  <span className="text-sm font-normal text-gray-500">
                    {events.length} events
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : (
                  <div className="h-96 w-full">
                    <MapContainer
                      center={events.length > 0 ? [events[0].lat, events[0].lng] : [0, 0]}
                      zoom={events.length > 0 ? 10 : 2}
                      style={{ height: "100%", width: "100%" }}
                      className="z-0"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© OpenStreetMap contributors'
                      />
                      <MapClickHandler onMapClick={handleMapClick} />
                      {events.map((event) => (
                        <Marker key={event.id} position={[event.lat, event.lng]}>
                          <Popup>
                            <div className="min-w-48">
                              <h3 className="font-medium text-black mb-1">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              )}
                              <div className="text-xs text-gray-500 space-y-1">
                                <div className="flex items-center gap-1">
                                  <MapPin size={10} />
                                  {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                                </div>
                                <div>
                                  {new Date(event.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Events List */}
            {events.length > 0 && (
              <Card className="border border-gray-200 shadow-none mt-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-black">Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-black">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                              </span>
                              <span>{new Date(event.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}