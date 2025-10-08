import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button"; // shadcn/ui button
import { Input } from "@/components/ui/input";   // shadcn/ui input
import { Textarea } from "@/components/ui/textarea"; // shadcn/ui textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn/ui card
import { PlusCircle, MapPin } from "lucide-react"; // lucide icons

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

  useEffect(() => {
    fetch("http://localhost:3001/api/events")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newEvent = await res.json();
    setEvents([newEvent, ...events]);
    setForm({ title: "", description: "", lat: "", lng: "" });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-blue-500" />
            Simple Events App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Event Title"
              required
              autoFocus
            />
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Event Description"
              rows={3}
            />
            <div className="flex gap-2">
              <Input
                name="lat"
                value={form.lat}
                onChange={handleChange}
                placeholder="Latitude (DD)"
                required
                type="number"
                step="any"
              />
              <Input
                name="lng"
                value={form.lng}
                onChange={handleChange}
                placeholder="Longitude (DD)"
                required
                type="number"
                step="any"
              />
            </div>
            <Button type="submit" className="w-full flex items-center gap-2">
              <PlusCircle size={18} /> Add Event
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events Map</CardTitle>
        </CardHeader>
        <CardContent>
          <MapContainer center={[0, 0]} zoom={2} style={{ height: "400px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {events.map((event) => (
              <Marker key={event.id} position={[event.lat, event.lng]}>
                <Popup>
                  <strong>{event.title}</strong>
                  <br />
                  {event.description}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </CardContent>
      </Card>
    </div>
  );
}