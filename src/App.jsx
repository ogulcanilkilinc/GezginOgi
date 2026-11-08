import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_PLACES, CATEGORIES, REGIONS, SEASONS, DURATIONS } from './data/initialPlaces';
import TravelMap from './components/TravelMap';
import PlaceDetailPanel from './components/PlaceDetailPanel';
import PlaceFormModal from './components/PlaceFormModal';
import PassportModal from './components/PassportModal';
import SearchableLocationModal from './components/SearchableLocationModal';
import PackingChecklistModal from './components/PackingChecklistModal';
import CurrencyBudgetModal from './components/CurrencyBudgetModal';
import ItineraryModal from './components/ItineraryModal';
import BorderCrossingsModal from './components/BorderCrossingsModal';
import TravelSoundtrackModal from './components/TravelSoundtrackModal';
import RouteSimulatorModal from './components/RouteSimulatorModal';
import NearbyRadarModal from './components/NearbyRadarModal';
import ScratchMapModal from './components/ScratchMapModal';
import EmergencyConsulateModal from './components/EmergencyConsulateModal';
import SeasonalCalendarModal from './components/SeasonalCalendarModal';
import CloudSyncModal from './components/CloudSyncModal';
import {
  Compass,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Map as MapIcon,
  LayoutGrid,
  Download,
  Upload,
  RotateCcw,
  Shuffle,
  Calendar,
  Utensils,
  ChevronRight,
  Filter,
  Route,
  X,
  Award,
  Sparkles,
  SlidersHorizontal,
  Cloud
} from 'lucide-react';

const STORAGE_KEY = 'kesif_atlasim_places_v8';

export default function App() {
  const [places, setPlaces] = useState(() => {
    try {
      // Clear legacy storage keys to ensure deduplicated places & Gezgin Ogi pack load fresh
      localStorage.removeItem('kesif_atlasim_places_v3');
      localStorage.removeItem('kesif_atlasim_places_v4');
      localStorage.removeItem('kesif_atlasim_places_v5');
      localStorage.removeItem('kesif_atlasim_places_v6');
      localStorage.removeItem('kesif_atlasim_places_v7');

      const savedV8 = localStorage.getItem(STORAGE_KEY);
      if (savedV8) {
        const parsed = JSON.parse(savedV8);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('LocalStorage okuma hatası:', e);
    }
    // Clean initial state: 100% unvisited and unfavorited with curated photos and deduplicated places
    return INITIAL_PLACES.map((p) => ({
      ...p,
      visited: false,
      visitedDate: '',
      favorite: false
    }));
  });

  // Filters & Navigation State
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeSubRegion, setActiveSubRegion] = useState('all');
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeCity, setActiveCity] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todo'); // Default: 'todo' (Ana Harita / Keşfedilecekler)
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(80);

  // Mobile & Compact Filter States
  const [mobileTab, setMobileTab] = useState('map'); // 'map' or 'list'
  const [isExtraFiltersOpen, setIsExtraFiltersOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // View Mode: 'split' (Harita + Liste/Detay), 'blog' (Tam Ekran Gezi Blogu), 'map' (Tam Ekran Harita)
  const [viewMode, setViewMode] = useState('split');

  // Selected Place & Map Camera
  const [selectedPlaceId, setSelectedPlaceId] = useState('ank-anitkabir');
  const [mapFocus, setMapFocus] = useState({ center: [39.9208, 32.8541], zoom: 11 });
  const [showRoute, setShowRoute] = useState(false);

  // Numbered Trip Route Planner Basket
  const [tripPlanIds, setTripPlanIds] = useState([]);

  // Add / Edit Modal & Map Coordinate Picker
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isPackingOpen, setIsPackingOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isBorderOpen, setIsBorderOpen] = useState(false);
  const [isSoundtrackOpen, setIsSoundtrackOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isNearbyRadarOpen, setIsNearbyRadarOpen] = useState(false);
  const [isScratchMapOpen, setIsScratchMapOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSeasonalCalendarOpen, setIsSeasonalCalendarOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('kesif_atlasim_admin_pin') || '1923';
  });

  const handleSetAdminPin = (pin, adminStatus) => {
    setAdminPin(pin);
    setIsAdmin(adminStatus);
    localStorage.setItem('kesif_atlasim_admin_pin', pin);
  };
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);

  const fileInputRef = useRef(null);

  // Save to LocalStorage whenever places change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    } catch (e) {
      console.error('LocalStorage kaydetme hatası:', e);
    }
  }, [places]);

  const matchesRegionScope = (p, regId) => {
    if (regId === 'all') return true;
    if (regId === 'balkanlar') return Boolean(p.isBalkan);
    return p.region === regId;
  };

  // Available SubRegions for current Region
  const availableSubRegions = useMemo(() => {
    const scope = places.filter((p) => matchesRegionScope(p, activeRegion));
    const set = new Set();
    scope.forEach((p) => {
      if (p.subRegion) set.add(p.subRegion);
    });
    return Array.from(set);
  }, [places, activeRegion]);

  // Available Countries with counts (sorted by count descending)
  const availableCountries = useMemo(() => {
    const scope = places.filter((p) => matchesRegionScope(p, activeRegion));
    const counts = new Map();
    scope.forEach((p) => {
      const c = p.country || (p.region === 'dunya' ? 'Uluslararası' : 'Türkiye');
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [places, activeRegion]);

  // Filtered Places
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (!matchesRegionScope(p, activeRegion)) return false;
      if (activeSubRegion !== 'all' && p.subRegion !== activeSubRegion) return false;
      if (activeCountry !== 'all' && p.country !== activeCountry) return false;
      if (activeCity !== 'all' && p.city !== activeCity) return false;
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (statusFilter === 'visited' && !p.visited) return false;
      if (statusFilter === 'todo' && p.visited) return false;
      if (statusFilter === 'favorite' && !p.favorite) return false;
      if (seasonFilter !== 'all' && !(p.seasons || []).includes(seasonFilter)) return false;
      if (durationFilter !== 'all' && p.durationCategory !== durationFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCity = p.city?.toLowerCase().includes(q);
        const matchCountry = p.country?.toLowerCase().includes(q);
        const matchSub = p.subRegion?.toLowerCase().includes(q);
        const matchAwaits = p.whatAwaits?.toLowerCase().includes(q);
        const matchFood = p.localSpecialties?.toLowerCase().includes(q);
        const matchBlog = p.blogArticle?.toLowerCase().includes(q);
        return matchName || matchCity || matchCountry || matchSub || matchAwaits || matchFood || matchBlog;
      }
      return true;
    });
  }, [
    places,
    activeRegion,
    activeSubRegion,
    activeCountry,
    activeCity,
    activeCategory,
    statusFilter,
    seasonFilter,
    durationFilter,
    searchQuery
  ]);

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId) || null,
    [places, selectedPlaceId]
  );

  // Stats for Progress Bar & Mode Badges
  const stats = useMemo(() => {
    const scopeList = places.filter((p) => matchesRegionScope(p, activeRegion));
    const total = scopeList.length;
    const visitedCount = scopeList.filter((p) => p.visited).length;
    const todoCount = total - visitedCount;
    const favoriteCount = scopeList.filter((p) => p.favorite).length;
    const percent = total > 0 ? Math.round((visitedCount / total) * 100) : 0;
    return { total, visitedCount, todoCount, favoriteCount, percent };
  }, [places, activeRegion]);

  // Handlers
  const handleRegionChange = (regionId) => {
    setActiveRegion(regionId);
    setActiveSubRegion('all');
    setActiveCountry('all');
    setActiveCity('all');
    setVisibleLimit(80);
    const regObj = REGIONS.find((r) => r.id === regionId) || REGIONS[0];
    setMapFocus({ center: regObj.center, zoom: regObj.zoom });
  };

  const handleLocationSelect = (countryName, cityName = 'all') => {
    setActiveCountry(countryName);
    setActiveCity(cityName);
    setIsLocationModalOpen(false);
    setVisibleLimit(100);

    if (countryName === 'all') {
      const regObj = REGIONS.find((r) => r.id === activeRegion) || REGIONS[0];
      setMapFocus({ center: regObj.center, zoom: regObj.zoom });
      return;
    }

    if (cityName !== 'all') {
      const cityPlaces = places.filter(
        (p) => (countryName === 'all' || p.country === countryName) && p.city === cityName && p.coords?.length === 2
      );
      if (cityPlaces.length > 0) {
        const avgLat = cityPlaces.reduce((s, p) => s + p.coords[0], 0) / cityPlaces.length;
        const avgLng = cityPlaces.reduce((s, p) => s + p.coords[1], 0) / cityPlaces.length;
        setMapFocus({ center: [avgLat, avgLng], zoom: 12 });
        return;
      }
    }

    const countryPlaces = places.filter((p) => p.country === countryName && p.coords?.length === 2);
    if (countryPlaces.length > 0) {
      const avgLat = countryPlaces.reduce((s, p) => s + p.coords[0], 0) / countryPlaces.length;
      const avgLng = countryPlaces.reduce((s, p) => s + p.coords[1], 0) / countryPlaces.length;
      const targetZoom =
        countryName === 'Türkiye' ? 6 : countryPlaces.length > 20 ? 6 : 8;
      setMapFocus({ center: [avgLat, avgLng], zoom: targetZoom });
    }
  };

  const handleCountryChange = (countryName) => {
    handleLocationSelect(countryName, 'all');
  };

  const handleSelectPlace = (place) => {
    if (!place) return;
    setSelectedPlaceId(place.id);
    setIsMobileDetailOpen(true);
    if (place.coords && place.coords.length === 2) {
      const targetZoom = place.region === 'ankara' ? 14 : place.region === 'turkiye' ? 11 : 9;
      setMapFocus({ center: place.coords, zoom: targetZoom });
    }
  };

  const handleToggleVisited = (placeId, e) => {
    if (e) e.stopPropagation();
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id !== placeId) return p;
        const nextVisited = !p.visited;
        if (nextVisited) {
          try {
            confetti({
              particleCount: 55,
              spread: 65,
              origin: { y: 0.7 }
            });
          } catch (_) {}
        }
        return {
          ...p,
          visited: nextVisited,
          visitedDate: nextVisited ? p.visitedDate || new Date().toISOString().slice(0, 10) : ''
        };
      })
    );
  };

  const handleToggleFavorite = (placeId, e) => {
    if (e) e.stopPropagation();
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, favorite: !p.favorite } : p))
    );
  };

  const handleToggleTripPlan = (placeId, e) => {
    if (e) e.stopPropagation();
    setTripPlanIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const handleUpdateNotes = (placeId, updates) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, ...updates } : p))
    );
  };

  const handleSavePlace = (placeData) => {
    setPlaces((prev) => {
      const exists = prev.some((p) => p.id === placeData.id);
      if (exists) {
        return prev.map((p) => (p.id === placeData.id ? placeData : p));
      }
      return [placeData, ...prev];
    });
    setSelectedPlaceId(placeData.id);
    setMapFocus({ center: placeData.coords, zoom: 14 });
    setIsFormOpen(false);
    setEditingPlace(null);
    setPickedCoords(null);
  };

  const handleDeletePlace = (placeId) => {
    if (!window.confirm('Bu mekanı haritandan silmek istediğine emin misin?')) return;
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    if (selectedPlaceId === placeId) {
      setSelectedPlaceId(null);
    }
  };

  const handleRandomSurprise = () => {
    const unvisited = filteredPlaces.filter((p) => !p.visited);
    const pool = unvisited.length > 0 ? unvisited : filteredPlaces;
    if (pool.length === 0) return;
    const randomPlace = pool[Math.floor(Math.random() * pool.length)];
    handleSelectPlace(randomPlace);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(places, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute(
      'download',
      `kesif-atlasim-yedek-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          setPlaces(imported);
          alert(`${imported.length} mekan başarıyla haritana yüklendi!`);
        }
      } catch (err) {
        alert('Geçersiz yedek dosyası formatı.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllVisited = () => {
    if (
      window.confirm(
        'Tüm haritadaki işaretlenmiş yerleri temizleyip "Gitmedim" yapmak istediğine emin misin? (Böylece tüm mekanlar ana haritana geri döner ve sıfırdan işaretleyebilirsin)'
      )
    ) {
      setPlaces((prev) =>
        prev.map((p) => ({
          ...p,
          visited: false,
          visitedDate: ''
        }))
      );
      setStatusFilter('todo');
      alert('Tüm mekanlar "Gitmedim" olarak güncellendi ve ana haritana yerleştirildi!');
    }
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Varsayılan başlangıç rehber verilerine dönmek istediğine emin misin? (Tüm yerler gitmedim olarak sıfırlanacaktır)'
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('kesif_atlasim_places_v3');
      localStorage.removeItem('kesif_atlasim_places_v4');
      localStorage.removeItem('kesif_atlasim_places_v5');
      const resetList = INITIAL_PLACES.map((p) => ({ ...p, visited: false, visitedDate: '', favorite: false }));
      setPlaces(resetList);
      setSelectedPlaceId(resetList[0]?.id || null);
      setStatusFilter('todo');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ================= TOP NAVIGATION HEADER ================= */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-serif tracking-tight text-white">
                  Keşif Atlasım
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full">
                  {places.length} Özel Rehber Noktası
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ankara • Türkiye • Dünya İnteraktif Gezi Haritası & Seyahat Blogu
              </p>
            </div>
          </div>

          {/* Region Scope Switcher (Ankara / Türkiye / Balkanlar / Dünya) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 gap-1 overflow-x-auto">
            {REGIONS.map((reg) => {
              const count = places.filter((p) => matchesRegionScope(p, reg.id)).length;
              const isActive = activeRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => handleRegionChange(reg.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{reg.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Actions: View Mode, Surprise Me, Backup & Add Place */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'split'
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bölünmüş Görünüm: Rehber + Harita"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Rehber + Harita</span>
              </button>
              <button
                onClick={() => setViewMode('blog')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'blog'
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Gezi Blogu & Dergi Görünümü"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Gezi Blogu</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'map'
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tam Ekran Harita"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Tam Harita</span>
              </button>
            </div>

            {/* Itinerary / Trip Plan Button */}
            <button
              onClick={() => setIsItineraryOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                tripPlanIds.length > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
              title="Gün Gün Seyahat Planlayıcısı & Yazdırılabilir Gezi Rehberi"
            >
              <span>📅</span>
              <span className="hidden lg:inline">Rota Planı</span>
              {tripPlanIds.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {tripPlanIds.length}
                </span>
              )}
            </button>

            {/* Smart Packing Checklist Button */}
            <button
              onClick={() => setIsPackingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition"
              title="Akıllı Bavul & Seyahat Öncesi Kontrol Listesi"
            >
              <span>🎒</span>
              <span className="hidden xl:inline">Bavul Listesi</span>
            </button>

            {/* Currency & Budget Tracker Button */}
            <button
              onClick={() => setIsBudgetOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition"
              title="Çoklu Para Birimi (BAM, RSD, ALL, MKD, EUR) ve Seyahat Bütçesi"
            >
              <span>💱</span>
              <span className="hidden xl:inline">Bütçe & Döviz</span>
            </button>

            {/* Traveler Toolbox Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  isToolsDropdownOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
                title="Gezgin Alet Çantası: Sınır Kapıları, Yol Şarkıları, GPS Radar, Rota Simülatörü ve Konsolosluk"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">Gezgin Araçları</span>
                <span className="text-[10px] opacity-75">▾</span>
              </button>

              {isToolsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[540] bg-slate-950/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsToolsDropdownOpen(false)}
                  />
                  <div
                    className="fixed lg:absolute bottom-16 lg:bottom-auto left-4 right-4 lg:left-auto lg:right-0 lg:mt-2 lg:w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-[550] backdrop-blur-xl animate-fadeIn space-y-1"
                    onClick={() => setIsToolsDropdownOpen(false)}
                  >
                  <button
                    onClick={() => setIsCloudSyncOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">☁️</span>
                    <div>
                      <strong className="block text-slate-100">Bulut Senkronizasyon & PIN</strong>
                      <span className="text-[10px] text-slate-400">Telefon ve bilgisayarı canlı eşitle</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsSeasonalCalendarOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">🗓️</span>
                    <div>
                      <strong className="block text-slate-100">Bu Ay Nereye Gitsem? (12 Ay)</strong>
                      <span className="text-[10px] text-slate-400">Mevsimsel hava durumu ve ideal kaçış rotaları</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsBorderOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">🚗</span>
                    <div>
                      <strong className="block text-slate-100">Balkan Sınır Kapıları & Vinyet</strong>
                      <span className="text-[10px] text-slate-400">Canlı süreler, taktikler, otoyol pulları</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsSoundtrackOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">🎵</span>
                    <div>
                      <strong className="block text-slate-100">Yolun Şarkıları & Ambiyans</strong>
                      <span className="text-[10px] text-slate-400">Sevdalinka, Akdeniz ezgileri, canlı yağmur</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsSimulatorOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">🗺️</span>
                    <div>
                      <strong className="block text-slate-100">İnteraktif Rota Simülatörü</strong>
                      <span className="text-[10px] text-slate-400">Duraklar arası canlı yol animasyonu & km</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsNearbyRadarOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">📍</span>
                    <div>
                      <strong className="block text-slate-100">Bana En Yakın Noktalar (GPS)</strong>
                      <span className="text-[10px] text-slate-400">Bulunduğun yere göre canlı mesafe & pusula</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsScratchMapOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">🎨</span>
                    <div>
                      <strong className="block text-slate-100">Kazı-Kazan Dünya & Fetih Atlası</strong>
                      <span className="text-[10px] text-slate-400">Ülke fetih oranları ve seyahat karnen</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsEmergencyOpen(true)}
                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-rose-950/40 text-rose-300 flex items-center gap-2.5 transition border-t border-slate-800/80 pt-2"
                  >
                    <span className="text-base">🚨</span>
                    <div>
                      <strong className="block text-rose-200">Acil Durum & T.C. Konsolosluk</strong>
                      <span className="text-[10px] text-slate-400">7/24 nöbetçi hatlar, polis, pasaport kaybı</span>
                    </div>
                  </button>
                </div>
              </>
              )}
            </div>

            {/* Passport Modal Button */}
            <button
              onClick={() => setIsPassportOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
              title="Keşif Pasaportum, İstatistiklerim ve Rozetlerim"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Pasaportum ({ places.filter(p => p.visited).length })</span>
            </button>

            {/* Surprise Me Button */}
            <button
              onClick={handleRandomSurprise}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold transition"
              title="Bana henüz gitmediğim rastgele bir keşif noktası öner"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Nereye Gitsem?</span>
            </button>

            {/* Bu Ay Nereye Gitsem Modal Button */}
            <button
              onClick={() => setIsSeasonalCalendarOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
              title="12 Ay Mevsim Rehberi: Bu ay nereye gitmeli?"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Bu Ay Nereye Gitsem?</span>
            </button>

            {/* Cloud Sync Button */}
            <button
              onClick={() => setIsCloudSyncOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition"
              title="Cihazlar Arası Bulut Eşleme & Güvenlik PIN'i"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Bulut Eşleme</span>
            </button>

            {/* Export / Import Backup */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
                title="Haritamı ve notlarımı yedekle (JSON İndir)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition"
                title="Yedek dosyasından geri yükle"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <button
                onClick={handleResetDemo}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition"
                title="Varsayılan mekanları sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Place Button */}
            <button
              onClick={() => {
                setEditingPlace(null);
                setIsFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Yer Ekle</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= FILTER & PROGRESS BAR ================= */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 lg:px-6 py-2 space-y-2">
        {activeRegion === 'balkanlar' && (
          <div className="max-w-[1800px] mx-auto bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/60 border border-emerald-500/30 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-lg">🌸</span>
              <div>
                <strong className="text-emerald-300 font-bold">
                  Nisan Ayı Balkanlar Özel Planlayıcısı:
                </strong>{' '}
                <span className="text-slate-200">
                  Kar erimesiyle şelalelerin (Kravice, Osumi, Krka, Una, Ak Drin) en gür aktığı, Kotor Körfezi mor salkımlarının açtığı ve Šargan 8 nostaljik treninin (1 Nisan) başladığı en ideal dönem!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                onClick={() => setActiveSubRegion(activeSubRegion === 'Balkanlar (Nisan Özel)' ? 'all' : 'Balkanlar (Nisan Özel)')}
                className={`px-2.5 py-1 rounded-xl font-bold border transition ${
                  activeSubRegion === 'Balkanlar (Nisan Özel)'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                }`}
              >
                {activeSubRegion === 'Balkanlar (Nisan Özel)' ? '✓ Sadece Nisan Özel Rotaları Gösteriliyor' : '✨ Sadece Nisan Özel Eklemelerini Filtrele'}
              </button>
            </div>
          </div>
        )}
        {/* Ultra-Clean Single-Row Primary Toolbar */}
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Category Chips (Smooth Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Tools: Search + Country Modal + Status Switcher + Expand Filters */}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mekan, şehir ara..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Location Selector Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="bg-slate-950 border border-amber-500/50 hover:border-amber-400 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-bold flex items-center gap-1.5 transition shadow-sm hover:bg-slate-900 shrink-0"
              title="Ülke ve Şehir Arama / Seçim Paneli"
            >
              <span>🌍</span>
              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                {activeCountry === 'all'
                  ? 'Ülke & Şehir'
                  : activeCity !== 'all'
                  ? `${activeCountry} › ${activeCity}`
                  : activeCountry}
              </span>
              <span className="text-[10px] text-amber-400/80">▾</span>
            </button>

            {/* Quick clear city button if a city is active */}
            {activeCity !== 'all' && (
              <button
                onClick={() => setActiveCity('all')}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl px-2 py-1 text-[11px] font-semibold flex items-center gap-1 transition"
                title="Şehir filtresini kaldır, tüm ülkeyi göster"
              >
                <span>{activeCity}</span>
                <X className="w-3 h-3 text-amber-300" />
              </button>
            )}

            {/* Visited Status Filter: Keşfedilecekler vs Gittiklerim */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-0.5 flex items-center text-[11px] font-semibold shrink-0">
              <button
                onClick={() => setStatusFilter('todo')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === 'todo'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Ana Harita: Henüz gidilmemiş keşif noktaları (Gittikçe listeden düşer)"
              >
                <span>🧭</span>
                <span>Keşfedilecekler ({stats.todoCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('visited')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === 'visited'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Gittiklerim Listesi: İşaretlediğin yerler"
              >
                <span>✅</span>
                <span>Gittiklerim ({stats.visitedCount})</span>
              </button>
            </div>

            {/* Detaylı Filtreler Toggle Button */}
            <button
              onClick={() => setIsExtraFiltersOpen(!isExtraFiltersOpen)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition shrink-0 ${
                isExtraFiltersOpen || activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter === 'favorite'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Kıta/Bölge, Mevsim, Süre ve Favori Filtrelerini Aç/Kapat"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtreler</span>
              {(activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter === 'favorite') && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Compact Expandable Secondary Filter Row (Only when opened or filter active) */}
        {(isExtraFiltersOpen || activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter === 'favorite' || tripPlanIds.length > 0) && (
          <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 animate-fadeIn text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* SubRegion Dropdown (Replaces 15 cluttered buttons) */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Bölge:</span>
                <select
                  value={activeSubRegion}
                  onChange={(e) => setActiveSubRegion(e.target.value)}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-400 cursor-pointer max-w-[170px] truncate"
                >
                  <option value="all">🌍 Tüm Kıtalar & Bölgeler</option>
                  {availableSubRegions.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season Filter Dropdown */}
              <select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="all">🌤️ Tüm Mevsimler</option>
                {SEASONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>

              {/* Duration Filter Dropdown */}
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {DURATIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>

              {/* Favorites Status Filter */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'favorite' ? 'todo' : 'favorite')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition ${
                  statusFilter === 'favorite'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <span>★</span>
                <span>Favoriler ({stats.favoriteCount})</span>
              </button>

              {/* Clear All Filters */}
              {(activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter !== 'todo' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveSubRegion('all');
                    setActiveCountry('all');
                    setActiveCity('all');
                    setActiveCategory('all');
                    setStatusFilter('todo');
                    setSeasonFilter('all');
                    setDurationFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-amber-400 hover:underline px-1 py-0.5"
                >
                  Filtreleri Sıfırla
                </button>
              )}
            </div>

            {/* Active Trip Route Quick Bar */}
            {tripPlanIds.length > 0 && (
              <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 rounded-xl px-3 py-1 text-xs">
                <Route className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-200 font-semibold">
                  Gezi Rotam ({tripPlanIds.length} Durak):
                </span>
                <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md">
                  {tripPlanIds.map((id, i) => {
                    const pl = places.find((p) => p.id === id);
                    if (!pl) return null;
                    return (
                      <span
                        key={id}
                        onClick={() => handleSelectPlace(pl)}
                        className="cursor-pointer bg-slate-900/90 text-slate-200 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap hover:text-amber-300"
                      >
                        {i + 1}. {pl.name.split(':')[0].split('&')[0]}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setTripPlanIds([])}
                  className="text-rose-300 hover:text-white ml-1"
                  title="Rotayı temizle"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= MAIN WORKSPACE AREA ================= */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-2 sm:p-4 lg:p-5 overflow-hidden pb-16 lg:pb-4">
        {/* Mobile View Switcher (Harita vs Liste Tab Bar on < lg) */}
        <div className="lg:hidden flex items-center justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-2.5 shadow-sm">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mobileTab === 'map'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>🗺️ Harita</span>
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mobileTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>📋 Liste ({filteredPlaces.length})</span>
          </button>
        </div>

        {/* MODE 1: SPLIT VIEW (Places List + Active Detail + Interactive Map) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[560px]">
            {/* Left Column: Places List (Visible on desktop OR when mobileTab === 'list') */}
            <div
              className={`${
                mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
              } lg:col-span-4 xl:col-span-3 bg-slate-900/75 border border-slate-800/90 rounded-2xl flex-col overflow-hidden h-[calc(100vh-210px)] lg:h-full`}
            >
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {statusFilter === 'todo'
                    ? '🧭 Keşfedilecekler'
                    : statusFilter === 'visited'
                    ? '✅ Gittiklerim Listesi'
                    : statusFilter === 'favorite'
                    ? '★ Favoriler'
                    : 'Keşif Noktaları'}{' '}
                  ({filteredPlaces.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  {statusFilter === 'todo' ? 'Gittikçe listeden düşer' : '✓ Gittim • + Rota'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {filteredPlaces.length === 0 ? (
                  <div className="text-center py-12 px-4 text-slate-400 space-y-3">
                    <Filter className="w-8 h-8 mx-auto text-slate-600" />
                    {statusFilter === 'visited' ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Henüz 'Gittim' dediğin bir yer yok.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Haritada veya listede gezdiğin yerlerin yanındaki <strong>'✓ Gittim'</strong> butonuna tıklayarak işaretleyebilirsin. İşaretlediğin yerler ana haritayı ferahlatıp buraya toplanır.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">Bu filtreye uygun mekan bulunamadı.</p>
                    )}
                    <button
                      onClick={() => {
                        setActiveRegion('all');
                        setActiveSubRegion('all');
                        setActiveCountry('all');
                        setActiveCity('all');
                        setActiveCategory('all');
                        setStatusFilter('todo');
                        setSeasonFilter('all');
                        setDurationFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-xs text-amber-400 underline"
                    >
                      Tüm filtreleri sıfırla
                    </button>
                  </div>
                ) : (
                  <>
                    {filteredPlaces.slice(0, visibleLimit).map((place) => {
                      const catObj =
                        CATEGORIES.find((c) => c.id === place.category) || CATEGORIES[0];
                      const isSelected = selectedPlace?.id === place.id;
                      const tripIdx = tripPlanIds.indexOf(place.id);

                      return (
                        <div
                          key={place.id}
                          onClick={() => handleSelectPlace(place)}
                          className={`group rounded-xl p-3 border transition cursor-pointer flex gap-3 items-start ${
                            isSelected
                              ? 'bg-slate-800/95 border-amber-500/70 shadow-lg'
                              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                            <img
                              src={place.coverImage}
                              alt={place.name}
                              className={`w-full h-full object-cover ${
                                place.visited ? 'opacity-65 saturate-50' : ''
                              }`}
                              onError={(e) => {
                                e.target.src =
                                  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <span className="absolute bottom-1 right-1 text-xs bg-slate-950/80 rounded px-1">
                              {catObj.icon}
                            </span>
                            {tripIdx !== -1 && (
                              <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                                {tripIdx + 1}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h3
                                className={`text-xs sm:text-sm font-bold leading-snug truncate ${
                                  place.visited
                                    ? 'strikethrough-animated text-slate-400'
                                    : 'text-slate-100 group-hover:text-amber-300'
                                }`}
                              >
                                {place.name}
                              </h3>

                              <div className="flex items-center gap-0.5 shrink-0">
                                {/* Quick Add to Route Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleTripPlan(place.id, e)}
                                  className={`p-1 rounded-lg transition ${
                                    tripIdx !== -1
                                      ? 'text-rose-400 bg-rose-500/15'
                                      : 'text-slate-500 hover:text-rose-300 hover:bg-slate-700/50'
                                  }`}
                                  title="Gezi rotasına ekle/çıkar"
                                >
                                  <Route className="w-3.5 h-3.5" />
                                </button>

                                {/* Quick Check-off Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleVisited(place.id, e)}
                                  className={`p-1 rounded-lg transition ${
                                    place.visited
                                      ? 'text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25'
                                      : 'text-slate-500 hover:text-amber-300 hover:bg-slate-700/50'
                                  }`}
                                  title={
                                    place.visited
                                      ? 'Gidildi işaretini kaldır'
                                      : 'Gittim! (Üstünü çiz)'
                                  }
                                >
                                  {place.visited ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {place.city}
                            </div>

                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-300 flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded text-amber-300">
                                <Clock className="w-3 h-3" />
                                {place.duration}
                              </span>
                              {place.visited && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                                  ✓ Gidildi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredPlaces.length > visibleLimit && (
                      <div className="pt-2 pb-4 flex flex-col gap-2">
                        <button
                          onClick={() => setVisibleLimit((prev) => prev + 120)}
                          className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                        >
                          Daha Fazla Göster (+120) • Kalan: {filteredPlaces.length - visibleLimit}
                        </button>
                        <button
                          onClick={() => setVisibleLimit(filteredPlaces.length)}
                          className="w-full py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-[11px] font-medium transition"
                        >
                          Tümünü Listele ({filteredPlaces.length} Nokta)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Map + Desktop Detail Panel (Visible on desktop OR when mobileTab === 'map') */}
            <div
              className={`${
                mobileTab === 'map' ? 'block' : 'hidden lg:grid'
              } lg:col-span-8 xl:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-4 h-[calc(100vh-210px)] lg:h-full overflow-hidden relative`}
            >
              {/* Interactive Map */}
              <div
                className={`${
                  selectedPlace ? 'xl:col-span-6' : 'xl:col-span-12'
                } h-full relative rounded-2xl overflow-hidden`}
              >
                <TravelMap
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={handleSelectPlace}
                  mapFocus={mapFocus}
                  isPickingLocation={isPickingLocation}
                  onPickLocation={(coords) => {
                    setPickedCoords(coords);
                    setIsPickingLocation(false);
                    setIsFormOpen(true);
                  }}
                  pickedCoords={pickedCoords}
                  showRoute={showRoute}
                  onToggleRoute={() => setShowRoute(!showRoute)}
                  tripPlanIds={tripPlanIds}
                  onQuickAddFromSearch={(prefill) => {
                    setEditingPlace({
                      name: prefill.name,
                      city: prefill.city || 'Yeni Keşif',
                      region: activeRegion === 'all' ? 'dunya' : activeRegion,
                      category: 'kultur',
                      coords: prefill.coords,
                      duration: '2 - 3 Saat',
                      seasons: ['ilkbahar', 'sonbahar'],
                      visited: false,
                      favorite: true
                    });
                    setPickedCoords(prefill.coords);
                    setIsFormOpen(true);
                  }}
                />

                {/* Mobile Floating Button to View List */}
                <button
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden absolute bottom-4 left-1/2 -translate-y-0 -translate-x-1/2 z-[400] bg-slate-900/95 text-amber-300 border border-amber-500/40 shadow-2xl px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md active:scale-95 transition"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                  <span>Listeyi Gör ({filteredPlaces.length} Yer)</span>
                </button>
              </div>

              {/* Desktop Detail Panel (xl:col-span-6) */}
              {selectedPlace && (
                <div className="hidden xl:block xl:col-span-6 h-full overflow-hidden">
                  <PlaceDetailPanel
                    place={selectedPlace}
                    onClose={() => setSelectedPlaceId(null)}
                    onToggleVisited={handleToggleVisited}
                    onToggleFavorite={handleToggleFavorite}
                    onUpdateNotes={handleUpdateNotes}
                    onEditPlace={(pl) => {
                      setEditingPlace(pl);
                      setIsFormOpen(true);
                    }}
                    onDeletePlace={handleDeletePlace}
                    inTripPlan={tripPlanIds.includes(selectedPlace.id)}
                    onToggleTripPlan={handleToggleTripPlan}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Tablet Slide-Up Detail Modal (xl:hidden) */}
        {selectedPlace && isMobileDetailOpen && (
          <div className="xl:hidden fixed inset-0 z-[650] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-2xl h-[92vh] sm:h-[86vh] bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col animate-slideUp">
              <PlaceDetailPanel
                place={selectedPlace}
                onClose={() => {
                  setIsMobileDetailOpen(false);
                  setSelectedPlaceId(null);
                }}
                onToggleVisited={handleToggleVisited}
                onToggleFavorite={handleToggleFavorite}
                onUpdateNotes={handleUpdateNotes}
                onEditPlace={(pl) => {
                  setEditingPlace(pl);
                  setIsFormOpen(true);
                }}
                onDeletePlace={handleDeletePlace}
                inTripPlan={tripPlanIds.includes(selectedPlace.id)}
                onToggleTripPlan={handleToggleTripPlan}
              />
            </div>
          </div>
        )}

        {/* Mobile Bottom Quick Navigation Bar (Fixed bottom for phone screens) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[450] bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-4 py-2 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              mobileTab === 'map' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Harita</span>
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              mobileTab === 'list' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Liste ({filteredPlaces.length})</span>
          </button>
          <button
            onClick={() => setIsToolsDropdownOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-amber-300 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Araçlar</span>
          </button>
          <button
            onClick={() => setIsPassportOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-amber-300 transition"
          >
            <Award className="w-4 h-4" />
            <span>Pasaport</span>
          </button>
          <button
            onClick={() => {
              setEditingPlace(null);
              setIsFormOpen(true);
            }}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-amber-400 active:scale-90 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ekle</span>
          </button>
        </div>

        {/* MODE 2: BLOG & TRAVEL MAGAZINE VIEW */}
        {viewMode === 'blog' && (
          <div className="space-y-6 pb-12">
            {/* Blog Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kişisel Gezi Rehberi & Seyahat Blogu ({filteredPlaces.length} Makale)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Ankara’dan Dünyaya Keşif Notlarım
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Her durağın ne kadar sürede gezileceği, içeride seni nelerin beklediği, hangi mevsimde gidileceği, yöresel lezzetleri ve kendi anıların tek bir sayfada.
                </p>
              </div>

              <button
                onClick={() => setViewMode('split')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0"
              >
                <MapIcon className="w-4 h-4" />
                <span>Harita Görünümüne Dön</span>
              </button>
            </div>

            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlaces.slice(0, visibleLimit).map((place) => {
                const catObj =
                  CATEGORIES.find((c) => c.id === place.category) || CATEGORIES[0];
                const regObj =
                  REGIONS.find((r) => r.id === place.region) || REGIONS[0];

                return (
                  <article
                    key={place.id}
                    className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col hover:border-slate-700 transition"
                  >
                    {/* Card Image */}
                    <div className="relative h-56 overflow-hidden bg-slate-800">
                      <img
                        src={place.coverImage}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${catObj.bg}`}
                        >
                          {catObj.icon} {catObj.label}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs bg-slate-950/80 text-slate-200 border border-slate-700">
                          {regObj.flag} {place.city}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleVisited(place.id)}
                        className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition ${
                          place.visited
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900/85 text-slate-200 hover:bg-amber-500 hover:text-slate-950'
                        }`}
                      >
                        {place.visited ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✓ Gidildi</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Gittim İşaretle</span>
                          </>
                        )}
                      </button>

                      <div className="absolute bottom-3 left-4 right-4">
                        <h3
                          className={`text-xl font-serif font-bold text-white ${
                            place.visited ? 'strikethrough-animated' : ''
                          }`}
                        >
                          {place.name}
                        </h3>
                      </div>
                    </div>

                    {/* Article Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        {/* Quick Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Süre: {place.duration}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {(place.seasons || [])
                              .map((s) => SEASONS.find((x) => x.id === s)?.label)
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>

                        {/* What Awaits */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                            ✨ İçeride Seni Neler Bekliyor?
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {place.whatAwaits}
                          </p>
                        </div>

                        {/* Local Specialties */}
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                          <h4 className="text-xs font-bold text-orange-300 flex items-center gap-1.5 mb-1">
                            <Utensils className="w-3.5 h-3.5" />
                            <span>Yöresel Lezzet & Yakın Duraklar</span>
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {place.localSpecialties}
                          </p>
                        </div>

                        {/* Blog Story */}
                        {place.blogArticle && (
                          <div className="border-l-2 border-amber-500/50 pl-3.5 py-1">
                            <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed line-clamp-4">
                              "{place.blogArticle}"
                            </p>
                          </div>
                        )}

                        {/* Personal Journal Note */}
                        {place.userNotes && (
                          <div className="bg-slate-800/70 rounded-xl p-3 text-xs text-amber-200">
                            <strong className="block text-amber-400 mb-0.5">
                              📝 Benim Gezi Notum:
                            </strong>
                            {place.userNotes}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            handleSelectPlace(place);
                            setViewMode('split');
                          }}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <span>Haritada Göster & Tam Rehberi Oku</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingPlace(place);
                            setIsFormOpen(true);
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Düzenle
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {filteredPlaces.length > visibleLimit && (
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setVisibleLimit((prev) => prev + 120)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transition"
                >
                  Daha Fazla Makale Göster (+120) • Kalan: {filteredPlaces.length - visibleLimit}
                </button>
                <button
                  onClick={() => setVisibleLimit(filteredPlaces.length)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Tümünü Aç ({filteredPlaces.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: FULLSCREEN MAP VIEW */}
        {viewMode === 'map' && (
          <div className="h-[calc(100vh-176px)] min-h-[620px] relative">
            <TravelMap
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={(pl) => {
                handleSelectPlace(pl);
              }}
              mapFocus={mapFocus}
              isPickingLocation={isPickingLocation}
              onPickLocation={(coords) => {
                setPickedCoords(coords);
                setIsPickingLocation(false);
                setIsFormOpen(true);
              }}
              pickedCoords={pickedCoords}
              showRoute={showRoute}
              onToggleRoute={() => setShowRoute(!showRoute)}
              tripPlanIds={tripPlanIds}
              onQuickAddFromSearch={(prefill) => {
                setEditingPlace({
                  name: prefill.name,
                  city: prefill.city || 'Yeni Keşif',
                  region: activeRegion === 'all' ? 'dunya' : activeRegion,
                  category: 'kultur',
                  coords: prefill.coords,
                  duration: '2 - 3 Saat',
                  seasons: ['ilkbahar', 'sonbahar'],
                  visited: false,
                  favorite: true
                });
                setPickedCoords(prefill.coords);
                setIsFormOpen(true);
              }}
            />

            {/* Floating Mini Card if a Place is Selected in Full Map Mode */}
            {selectedPlace && (
              <div className="absolute bottom-5 right-5 z-[450] w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
                <PlaceDetailPanel
                  place={selectedPlace}
                  onClose={() => setSelectedPlaceId(null)}
                  onToggleVisited={handleToggleVisited}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateNotes={handleUpdateNotes}
                  onEditPlace={(pl) => {
                    setEditingPlace(pl);
                    setIsFormOpen(true);
                  }}
                  onDeletePlace={handleDeletePlace}
                  inTripPlan={tripPlanIds.includes(selectedPlace.id)}
                  onToggleTripPlan={handleToggleTripPlan}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= ADD / EDIT PLACE MODAL ================= */}
      <PlaceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlace(null);
        }}
        onSave={handleSavePlace}
        editingPlace={editingPlace}
        pickedCoords={pickedCoords}
        onStartPickOnMap={() => {
          setIsFormOpen(false);
          setViewMode('split');
          setIsPickingLocation(true);
        }}
      />

      {/* ================= PASSPORT & STATS MODAL ================= */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        places={places}
        onSelectPlace={handleSelectPlace}
      />

      {/* ================= SEARCHABLE COUNTRY & CITY MODAL ================= */}
      <SearchableLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        places={places}
        activeCountry={activeCountry}
        activeCity={activeCity}
        onSelectLocation={handleLocationSelect}
      />

      {/* ================= ITINERARY & PRINTABLE GUIDE MODAL ================= */}
      <ItineraryModal
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        places={places}
        tripPlanIds={tripPlanIds}
        onSelectPlace={handleSelectPlace}
        onSetTripPlanIds={setTripPlanIds}
      />

      {/* ================= PACKING CHECKLIST MODAL ================= */}
      <PackingChecklistModal
        isOpen={isPackingOpen}
        onClose={() => setIsPackingOpen(false)}
      />

      {/* ================= CURRENCY & BUDGET MODAL ================= */}
      <CurrencyBudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
      />

      {/* ================= BORDER CROSSINGS & VIGNETTE MODAL ================= */}
      <BorderCrossingsModal
        isOpen={isBorderOpen}
        onClose={() => setIsBorderOpen(false)}
      />

      {/* ================= TRAVEL SOUNDTRACK & AMBIENCE MODAL ================= */}
      <TravelSoundtrackModal
        isOpen={isSoundtrackOpen}
        onClose={() => setIsSoundtrackOpen(false)}
      />

      {/* ================= ROUTE SIMULATOR MODAL ================= */}
      <RouteSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        places={places}
        tripPlanIds={tripPlanIds}
        onSelectPlace={handleSelectPlace}
      />

      {/* ================= NEARBY GPS RADAR MODAL ================= */}
      <NearbyRadarModal
        isOpen={isNearbyRadarOpen}
        onClose={() => setIsNearbyRadarOpen(false)}
        places={places}
        onSelectPlace={handleSelectPlace}
      />

      {/* ================= SCRATCH CONQUEST MAP MODAL ================= */}
      <ScratchMapModal
        isOpen={isScratchMapOpen}
        onClose={() => setIsScratchMapOpen(false)}
        places={places}
      />

      {/* ================= EMERGENCY & CONSULATE MODAL ================= */}
      <EmergencyConsulateModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* ================= 12-MONTH SEASONAL CALENDAR MODAL ================= */}
      <SeasonalCalendarModal
        isOpen={isSeasonalCalendarOpen}
        onClose={() => setIsSeasonalCalendarOpen(false)}
        places={places}
        onSelectPlace={handleSelectPlace}
        onApplySeasonalFilter={(seasonId, keywords) => {
          setSeasonFilter(seasonId);
          if (keywords && keywords.length > 0) {
            setSearchQuery(keywords[0]);
          }
        }}
      />

      {/* ================= CLOUD SYNC & PIN SECURITY MODAL ================= */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        places={places}
        onUpdatePlaces={(updatedPlaces) => {
          setPlaces(updatedPlaces);
        }}
        isAdmin={isAdmin}
        adminPin={adminPin}
        onSetAdminPin={handleSetAdminPin}
      />
    </div>
  );
}
