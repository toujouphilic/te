"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StreamPage({ params }) {
  const { id } = params;
  const [stream, setStream] = useState(null);

  useEffect(() => {
    async function fetchStream() {
      const { data, error } = await supabase
        .from("streams")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setStream(data);
      }
    }
    fetchStream();
  }, [id]);

  if (!stream) {
    return <p className="p-8">Loading stream...</p>;
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>

      <p className="text-sm text-gray-600 mb-2">
        {new Date(stream.date).toLocaleDateString()}
      </p>

      <iframe
        width="100%"
        height="500"
        src={stream.youtube_url.replace("watch?v=", "embed/")}
        frameBorder="0"
        allowFullScreen
        title={stream.title}
        className="mb-4"
      />

      <p className="mb-2">{stream.description}</p>

      <div className="text-sm text-gray-500 mb-2">
        <p>Season: {stream.season || "N/A"}</p>
        <p>Streamer: {stream.streamer || "N/A"}</p>
        <p>SMP: {stream.smp ? "Yes" : "No"}</p>
        <p>Subtitles: {stream.subtitles ? "Yes" : "No"}</p>
      </div>

      {stream.tags && stream.tags.length > 0 && (
        <p className="text-sm text-gray-500">
          Tags: {stream.tags.join(", ")}
        </p>
      )}
    </main>
  );
}
