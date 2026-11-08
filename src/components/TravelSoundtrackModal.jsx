import React, { useState, useRef, useEffect } from 'react';
import { X, Music, Play, Square, Volume2, VolumeX, ExternalLink, Sparkles, Radio } from 'lucide-react';
import { TRAVEL_SOUNDTRACKS } from '../data/soundtracksData';

export default function TravelSoundtrackModal({ isOpen, onClose }) {
  const [selectedPlaylist, setSelectedPlaylist] = useState(TRAVEL_SOUNDTRACKS[0]);
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [ambientType, setAmbientType] = useState('rain'); // 'rain', 'waves', 'cafe'
  const [volume, setVolume] = useState(0.4);

  // Web Audio Context for Real Ambient Sound Generation (No external audio file dependencies!)
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodesRef = useRef([]);

  const stopAmbient = () => {
    sourceNodesRef.current.forEach((n) => {
      try {
        n.stop();
        n.disconnect();
      } catch (_) {}
    });
    sourceNodesRef.current = [];
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    setIsPlayingAmbient(false);
  };

  const startAmbient = (type) => {
    stopAmbient();

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      // Generate soft pink/brown noise for rain & ocean waves
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter depending on ambient type
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (type === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
      } else {
        // Cafe / warm hum
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
      }

      noise.connect(filter);
      filter.connect(gain);
      noise.start();

      sourceNodesRef.current = [noise];
      setIsPlayingAmbient(true);
      setAmbientType(type);
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl shadow-inner">
              🎵
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Yolun Şarkıları & Seyahat Ambiyansı</span>
              </h2>
              <p className="text-xs text-slate-400">
                Balkan Sevdalinkaları, Akdeniz ezgileri ve yol boyu dinlenecek başyapıtlar
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAmbient();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Bar (Built-in Audio Synthesizer) */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 animate-pulse text-amber-400" />
              <span>Canlı Yol Ambiyansı:</span>
            </span>

            <button
              onClick={() => (isPlayingAmbient && ambientType === 'rain' ? stopAmbient() : startAmbient('rain'))}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
                isPlayingAmbient && ambientType === 'rain'
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              🌧️ Bahar Yağmuru
            </button>

            <button
              onClick={() => (isPlayingAmbient && ambientType === 'waves' ? stopAmbient() : startAmbient('waves'))}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
                isPlayingAmbient && ambientType === 'waves'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              🌊 Adriyatik Dalgaları
            </button>

            <button
              onClick={() => (isPlayingAmbient && ambientType === 'cafe' ? stopAmbient() : startAmbient('cafe'))}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
                isPlayingAmbient && ambientType === 'cafe'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              ☕ Başçarşı Kahvehane
            </button>
          </div>

          {isPlayingAmbient && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-amber-400"
              />
              <button
                onClick={stopAmbient}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 ml-1"
              >
                Durdur
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TRAVEL_SOUNDTRACKS.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                  selectedPlaylist.id === pl.id
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🎵</span>
                <span>{pl.region}</span>
              </button>
            ))}
          </div>

          {/* Selected Playlist Hero Card */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-800">
              <img
                src={selectedPlaylist.cover}
                alt={selectedPlaylist.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase tracking-wider">
                    {selectedPlaylist.region} Özel Albümü
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {selectedPlaylist.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    {selectedPlaylist.subtitle}
                  </p>
                </div>

                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(selectedPlaylist.spotifyQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Spotify’da Çal</span>
                </a>
              </div>
            </div>

            {/* Tracks List */}
            <div className="p-4 sm:p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Önerilen İkonik Eserler ({selectedPlaylist.tracks.length}):
              </h4>
              <div className="divide-y divide-slate-800/70">
                {selectedPlaylist.tracks.map((tr, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-900/50 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                      <div className="min-w-0">
                        <strong className="text-xs sm:text-sm text-slate-100 block truncate">
                          {tr.name}
                        </strong>
                        <span className="text-xs text-slate-400 block truncate">{tr.artist}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-amber-300/90 px-2.5 py-1 rounded-lg font-medium">
                        {tr.mood}
                      </span>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(`${tr.artist} ${tr.name}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 transition"
                        title="Spotify'da Dinle"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
