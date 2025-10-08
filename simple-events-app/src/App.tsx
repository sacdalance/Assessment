import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  MapPin,
  Calendar,
  Globe,
  Loader2,
  CheckCircle
} from "lucide-react";
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

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: "", description: "", lat: "", lng: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch events on component mount
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
        throw new Error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success("Event created successfully!");
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = form.title.trim() && form.lat && form.lng;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Globe className="text-blue-600" size={40} />
            Simple Events App
          </h1>
          <p className="text-gray-600">Create and visualize events on an interactive map</p>
        </div>

        {/* Create Event Form */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PlusCircle className="text-green-600" size={24} />
              Create New Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event Title</label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter event title..."
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin size={16} className="text-red-500" />
                    Latitude (DD)
                  </label>
                  <Input
                    name="lat"
                    value={form.lat}
                    onChange={handleChange}
                    placeholder="e.g., 37.7749"
                    required
                    type="number"
                    step="any"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin size={16} className="text-red-500" />
                    Longitude (DD)
                  </label>
                  <Input
                    name="lng"
                    value={form.lng}
                    onChange={handleChange}
                    placeholder="e.g., -122.4194"
                    required
                    type="number"
                    step="any"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2" size={18} />
                    Create Event
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Events Map */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-600" size={24} />
                Events Map
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                {events.length} Event{events.length !== 1 ? 's' : ''}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
                  <p className="text-gray-500">Loading events...</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden shadow-md">
                <MapContainer
                  center={events.length > 0 ? [events[0].lat, events[0].lng] : [0, 0]}
                  zoom={events.length > 0 ? 10 : 2}
                  style={{ height: "500px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {events.map((event) => (
                    <Marker key={event.id} position={[event.lat, event.lng]}>
                      <Popup className="custom-popup">
                        <div className="space-y-2 min-w-48">
                          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={18} />
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-gray-600 text-sm">{event.description}</p>
                          )}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              Lat: {event.lat.toFixed(4)}, Lng: {event.lng.toFixed(4)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
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
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-purple-600" size={24} />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border">
                    <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(event.created_at).toLocaleDateString()}
                        </span>
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
  );
}