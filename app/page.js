"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function Home() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");           
  const [seasonFilter, setSeasonFilter] = useState(""); 
  const [streamerFilter, setStreamerFilter] = useState(""); 
  const [smpFilter, setSmpFilter] = useState("");       
  const [subtitleFilter, setSubtitleFilter] = useState(""); 
  const [tagFilter, setTagFilter] = useState("");       
  const [selectedDate, setSelectedDate] = useState(null); // calendar date

  // Fetch streams from Supabase
  useEffect(() => {
    async function fetchStreams() {
      const { data } = await supabase.from("streams").select();
      setData(data);
    }
    fetchStreams();
  }, []);

  // Filter streams
  const filteredData = data.filter(stream => {
    const matchesSearch =
      stream.title.toLowerCase().includes(search.toLowerCase()) ||
      (stream.description && stream.description.toLowerCase().includes(search.toLowerCase()));

    const matchesSeason = !seasonFilter || stream.season === seasonFilter;
    const matchesStreamer = !streamerFilter || stream.streamer === streamerFilter;
    const matchesSmp = !smpFilter || (smpFilter === "yes" ? stream.smp === true : true);
    const matchesSubtitles = !subtitleFilter || (subtitleFilter === "yes" ? stream.subtitles === true : true);
    const matchesTag = !tagFilter || (stream.tags && stream.tags.includes(tagFilter));

    const matchesDate = !selectedDate || 
      new Date(stream.date).toDateString() === selectedDate.toDateString();

    return matchesSearch && matchesSeason && matchesStreamer && matchesSmp && matchesSubtitles && matchesTag && matchesDate;
  });

  // Unique dropdown values
  const seasons = Array.from(new Set(data.map(d => d.season))).filter(Boolean);
  const streamers = Array.from(new Set(data.map(d => d.streamer))).filter(Boolean);
  const tags = Array.from(new Set(data.flatMap(d => d.tags || []))).filter(Boolean);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Stream Archive</h1>

      {/* Calendar */}
      <div className="mb-6">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          view="month"
          calendarType="US"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="mt-2 text-blue-600 hover:underline"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search streams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">All Seasons</option>
          {seasons.map(season => <option key={season} value={season}>{season}</option>)}
        </select>

        <select
          value={streamerFilter}
          onChange={(e) => setStreamerFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">All Streamers</option>
          {streamers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={smpFilter}
          onChange={(e) => setSmpFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">SMP (all)</option>
          <option value="yes">Yes</option>
        </select>

        <select
          value={subtitleFilter}
          onChange={(e) => setSubtitleFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">Subtitles (all)</option>
          <option value="yes">Yes</option>
        </select>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">All Tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Stream List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map(stream => (
          <div key={stream.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              <a
                href={`/stream/${stream.id}`}
                className="text-blue-600 hover:underline"
              >
                {stream.title}
              </a>
            </h2>

            <p className="text-sm text-gray-600 mb-2">{new Date(stream.date).toLocaleDateString()}</p>

            <iframe
              width="100%"
              height="225"
              src={stream.youtube_url.replace("watch?v=", "embed/")}
              frameBorder="0"
              allowFullScreen
              title={stream.title}
            />

            <p className="mt-2 text-sm">{stream.description}</p>

            <p className="mt-1 text-xs text-gray-500">
              Season: {stream.season || "N/A"} | Streamer: {stream.streamer || "N/A"} | SMP: {stream.smp ? "Yes" : "No"} | Subtitles: {stream.subtitles ? "Yes" : "No"}
            </p>

            {stream.tags && <p className="mt-1 text-xs text-gray-500">Tags: {stream.tags.join(", ")}</p>}
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <p className="mt-4 text-gray-500">No streams found.</p>
      )}
    </main>
  );
}
