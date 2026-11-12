import React, { useState, useEffect, useMemo, useRef, useDeferredValue, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES, REGIONS, SEASONS, DURATIONS } from './data/metadata';
import { getOptimizedImageUrl, coverOf } from './data/curatedPhotoResolver';
import { useAutoSync } from './services/useAutoSync';
import { useDocSync } from './services/useDocSync';
import { getSearchIndex, matchesSearch, matchesSearchKey } from './services/searchUtils';
import { createShareLink, readShareFromHash, leaveShareView } from './services/shareLink';
import { routeKm, formatKm, ROAD_FACTOR } from './services/geo';
import TravelMap from './components/TravelMap';
import PlaceDetailPanel from './components/PlaceDetailPanel';

// Lazy-loaded modals for lightning-fast initial page bundle (< 150 KB)
const PlaceFormModal = lazy(() => import('./components/PlaceFormModal'));
const PassportModal = lazy(() => import('./components/PassportModal'));
const SearchableLocationModal = lazy(() => import('./components/SearchableLocationModal'));
const PackingChecklistModal = lazy(() => import('./components/PackingChecklistModal'));
const CurrencyBudgetModal = lazy(() => import('./components/CurrencyBudgetModal'));
const ItineraryModal = lazy(() => import('./components/ItineraryModal'));
const BorderCrossingsModal = lazy(() => import('./components/BorderCrossingsModal'));
const TravelSoundtrackModal = lazy(() => import('./components/TravelSoundtrackModal'));
const RouteSimulatorModal = lazy(() => import('./components/RouteSimulatorModal'));
const NearbyRadarModal = lazy(() => import('./components/NearbyRadarModal'));
const ScratchMapModal = lazy(() => import('./components/ScratchMapModal'));
const EmergencyConsulateModal = lazy(() => import('./components/EmergencyConsulateModal'));
const SeasonalCalendarModal = lazy(() => import('./components/SeasonalCalendarModal'));
const CloudSyncModal = lazy(() => import('./components/CloudSyncModal'));
const CountryIntelModal = lazy(() => import('./components/CountryIntelModal'));

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
  Cloud,
  Lock,
  Unlock,
  ShieldCheck,
  WifiOff
} from 'lucide-react';

const USER_OVERRIDES_KEY = 'kesif_atlasim_user_overrides_v1';
// User photos are kept under their own key so a full photo store never blocks saving visits and notes
const USER_PHOTOS_KEY = 'kesif_atlasim_user_photos_v1';

const TRIP_KEY = 'kesif_atlasim_trip_v1';
// Content version of the guide data this device has loaded (see places-version.json)
const DATA_VERSION_KEY = 'kesif_atlasim_data_version_v1';

function readStoredTrip() {
  try {
    const t = JSON.parse(localStorage.getItem(TRIP_KEY) || 'null');
    if (t && Array.isArray(t.ids)) return t;
  } catch (e) {}
  return { ids: [], days: {}, name: '', startDate: '' };
}

// Season that contains today's date (Northern Hemisphere, like the guide data)
function currentSeasonId() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'ilkbahar';
  if (m >= 6 && m <= 8) return 'yaz';
  if (m >= 9 && m <= 11) return 'sonbahar';
  return 'kis';
}

// Small status light on the cloud button
function SyncDot({ status, message }) {
  if (status === 'off') return null;
  const styles = {
    ok: ['bg-emerald-500', 'Bulut ile eşit'],
    syncing: ['bg-amber-400 animate-pulse', 'Eşitleniyor…'],
    pending: ['bg-amber-400', 'Gönderilmeyi bekleyen değişiklik var'],
    error: ['bg-rose-500', message || 'Eşitleme hatası']
  };
  const [cls, label] = styles[status] || styles.ok;
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} title={label} aria-label={label} />;
}

function readStoredPhotos() {
  try {
    return JSON.parse(localStorage.getItem(USER_PHOTOS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

export default function App() {
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [updateNotification, setUpdateNotification] = useState(null);
  // Read-only view of someone's shared map (#paylas=...): nothing is saved or synced
  const [shareView, setShareView] = useState(null);

  const handleApplyUpdate = (freshRaw, version) => {
    try {
      if (version) localStorage.setItem(DATA_VERSION_KEY, version);
    } catch (e) {}
    let merged = freshRaw;
    try {
      const rawOverrides = localStorage.getItem(USER_OVERRIDES_KEY);
      if (rawOverrides) {
        const overrides = JSON.parse(rawOverrides);
        const storedPhotos = readStoredPhotos();
        merged = freshRaw.map((p) => {
          const ov = overrides[p.id];
          if (!ov) return p;
          return {
            ...p,
            visited: ov.visited !== undefined ? ov.visited : p.visited,
            visitedDate: ov.visitedDate || p.visitedDate || '',
            favorite: ov.favorite !== undefined ? ov.favorite : p.favorite,
            userRating: ov.userRating !== undefined ? ov.userRating : (p.userRating || 0),
            userNotes: ov.userNotes !== undefined ? ov.userNotes : (p.userNotes || ''),
            userPhotos: storedPhotos[p.id] || ov.userPhotos || p.userPhotos || [],
            checklist: ov.checklist !== undefined ? ov.checklist : (p.checklist || [])
          };
        });
        Object.values(overrides).forEach((ov) => {
          if (ov.isCustom && !merged.some((p) => p.id === ov.isCustom.id)) {
            merged.push(ov.isCustom);
          }
        });
      }
    } catch (e) {}
    setPlaces(merged);
    setUpdateNotification(null);
  };

  // Fast async data loading + granular overrides merge (< 2 KB in localStorage)
  // Prevents mobile browser freezes and eliminates 2.5 MB localStorage bottlenecks!
  useEffect(() => {
    // Clean legacy heavy 2.5 MB blobs from localStorage
    try {
      localStorage.removeItem('kesif_atlasim_places_v3');
      localStorage.removeItem('kesif_atlasim_places_v4');
      localStorage.removeItem('kesif_atlasim_places_v5');
      localStorage.removeItem('kesif_atlasim_places_v6');
      localStorage.removeItem('kesif_atlasim_places_v7');
      localStorage.removeItem('kesif_atlasim_places_v8');
      localStorage.removeItem('kesif_atlasim_places_v9');
      localStorage.removeItem('kesif_atlasim_places_v10');
    } catch (e) {}

    const basePath = import.meta.env.BASE_URL || '/';
    const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

    fetch(`${cleanBase}data/places.json`)
      .then((res) => {
        if (!res.ok) throw new Error('places.json yüklenemedi');
        return res.json();
      })
      .then(async (rawPlaces) => {
        const share = await readShareFromHash();
        if (share) {
          setShareView(share);
          setPlaces(
            rawPlaces.map((p) => ({ ...p, visited: share.visited.has(p.id), favorite: share.favorite.has(p.id) }))
          );
          setStatusFilter('visited');
          setIsLoadingPlaces(false);
          return;
        }

        let merged = rawPlaces;
        try {
          const rawOverrides = localStorage.getItem(USER_OVERRIDES_KEY);
          if (rawOverrides) {
            const overrides = JSON.parse(rawOverrides);
            const storedPhotos = readStoredPhotos();
            merged = rawPlaces.map((p) => {
              const ov = overrides[p.id];
              if (!ov) return p;
              return {
                ...p,
                visited: ov.visited !== undefined ? ov.visited : p.visited,
                visitedDate: ov.visitedDate || p.visitedDate || '',
                favorite: ov.favorite !== undefined ? ov.favorite : p.favorite,
                userRating: ov.userRating !== undefined ? ov.userRating : (p.userRating || 0),
                userNotes: ov.userNotes !== undefined ? ov.userNotes : (p.userNotes || ''),
                userPhotos: storedPhotos[p.id] || ov.userPhotos || p.userPhotos || [],
                checklist: ov.checklist !== undefined ? ov.checklist : (p.checklist || [])
              };
            });

            // Append custom user places if any
            Object.values(overrides).forEach((ov) => {
              if (ov.isCustom && !merged.some((p) => p.id === ov.isCustom.id)) {
                merged.push(ov.isCustom);
              }
            });
          }
        } catch (err) {
          console.error('Overrides merge error:', err);
        }

        setPlaces(merged);
        setIsLoadingPlaces(false);

        // Background freshness check. The build publishes a tiny places-version.json; the full file is
        // downloaded again only when that version differs from the one this device last loaded.
        // A device that has no stored version yet does one full comparison to learn it.
        const fetchFresh = () =>
          fetch(`${cleanBase}data/places.json?_t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
        fetch(`${cleanBase}data/places-version.json?_t=${Date.now()}`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then(async (meta) => {
            const version = meta?.version;
            if (!version) return;
            const known = localStorage.getItem(DATA_VERSION_KEY);
            if (known === version) return;
            const freshRaw = await fetchFresh();
            if (!Array.isArray(freshRaw)) return;
            if (JSON.stringify(freshRaw) === JSON.stringify(rawPlaces)) {
              localStorage.setItem(DATA_VERSION_KEY, version);
              return;
            }
            setUpdateNotification({ oldLen: rawPlaces.length, newLen: freshRaw.length, freshRaw, version });
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error('Veri yükleme hatası:', err);
        setIsLoadingPlaces(false);
      });
  }, []);

  // Filters & Navigation State
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeSubRegion, setActiveSubRegion] = useState('all');
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeCity, setActiveCity] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todo'); // Default: 'todo' (Ana Harita / Keşfedilecekler)
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [weekendEscapeFilter, setWeekendEscapeFilter] = useState(false); // Ankara'dan 4.5 saatten yakın
  const [visaFreeFilter, setVisaFreeFilter] = useState(false); // Sadece Türk pasaportuyla vizesiz/kimlikle
  const [selectedCountryIntel, setSelectedCountryIntel] = useState(null); // Country Intel modal state
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [searchQuery, setSearchQuery] = useState('');
  // The list and map follow the query with a short lag so typing stays smooth on phones
  const deferredSearchQuery = useDeferredValue(searchQuery);
  // Once typing pauses, the map is fitted to the matches (they are often outside the current view)
  const [searchFitKey, setSearchFitKey] = useState(null);
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return undefined;
    const t = setTimeout(() => setSearchFitKey({ q }), 450);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const [visibleLimit, setVisibleLimit] = useState(80);

  // Online / Offline Network Status Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mobile & Compact Filter States
  const [mobileTab, setMobileTab] = useState('map'); // 'map' or 'list'

  // The map/list area fills the screen down to its bottom edge (on phones, down to the bottom bar).
  // Its top moves when the header content changes or wraps, so it is measured after every render
  // and on viewport changes.
  const splitRef = useRef(null);
  const bottomBarRef = useRef(null);
  const [splitHeight, setSplitHeight] = useState(null);
  useEffect(() => {
    const update = () => {
      const el = splitRef.current;
      if (!el) return;
      const desktop = window.innerWidth >= 1024;
      // innerHeight (the layout viewport) is what the fixed bottom bar is placed against; the visual
      // viewport shrinks with pinch zoom or the on-screen keyboard, which should not resize the map.
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Phones: stop 12 px above the bottom bar (taller on iPhones with a home indicator)
      const bar = bottomBarRef.current;
      const barHeight = bar ? bar.getBoundingClientRect().height : 52;
      const bottomGap = desktop ? 20 : barHeight + 12;
      setSplitHeight(Math.max(desktop ? 560 : 380, Math.round(window.innerHeight - top - bottomGap)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  });
  const [isExtraFiltersOpen, setIsExtraFiltersOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // View Mode: 'split' (Harita + Liste/Detay), 'blog' (Tam Ekran Gezi Blogu), 'map' (Tam Ekran Harita)
  const [viewMode, setViewMode] = useState('split');

  // Selected Place & Map Camera
  const [selectedPlaceId, setSelectedPlaceId] = useState('ank-anitkabir');
  const [mapFocus, setMapFocus] = useState({ center: [39.9208, 32.8541], zoom: 11 });
  const [showRoute, setShowRoute] = useState(false);

  // Numbered Trip Route Planner Basket
  const [tripPlanIds, setTripPlanIds] = useState(() => readStoredTrip().ids);
  // Trip details: day per stop, trip name and start date (saved with the route)
  const [tripMeta, setTripMeta] = useState(() => {
    const { days, name, startDate } = readStoredTrip();
    return { days: days || {}, name: name || '', startDate: startDate || '' };
  });
  const tripDoc = useMemo(() => ({ ids: tripPlanIds, ...tripMeta }), [tripPlanIds, tripMeta]);
  useEffect(() => {
    try {
      localStorage.setItem(TRIP_KEY, JSON.stringify(tripDoc));
    } catch (e) {}
  }, [tripDoc]);
  const tripTotalKm = useMemo(() => {
    const stops = tripPlanIds.map((id) => places.find((p) => p.id === id)).filter((p) => p && p.coords);
    return routeKm(stops) * ROAD_FACTOR;
  }, [tripPlanIds, places]);

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

  // Admin & Editing State: Starts as read-only visitor mode by default
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('kesif_atlasim_admin_pass') || '';
  });

  const handleSetAdminPin = (pass, adminStatus) => {
    setAdminPin(pass || '');
    setIsAdmin(adminStatus);
    if (pass) {
      localStorage.setItem('kesif_atlasim_admin_pass', pass);
    } else {
      localStorage.removeItem('kesif_atlasim_admin_pass');
    }
  };

  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  // Where the header button sits, so the desktop menu opens right under it (null: phone bottom sheet)
  const [toolsAnchor, setToolsAnchor] = useState(null);
  const [editingPlace, setEditingPlace] = useState(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);

  const fileInputRef = useRef(null);
  const storageWarnedRef = useRef(false);

  // Save user overrides to LocalStorage with quota overflow detection
  useEffect(() => {
    if (!places || places.length === 0 || isLoadingPlaces || shareView) return;
    try {
      const overrides = {};
      places.forEach((p) => {
        const hasNotes = p.userNotes && p.userNotes.trim();
        const hasPhotos = p.userPhotos && p.userPhotos.length > 0;
        const hasChecklist = p.checklist && p.checklist.some((c) => c.done);
        if (p.visited || p.favorite || hasNotes || hasPhotos || hasChecklist || p.userRating > 0 || p.isCustom) {
          overrides[p.id] = {
            visited: p.visited,
            visitedDate: p.visitedDate,
            favorite: p.favorite,
            userNotes: p.userNotes,
            userRating: p.userRating,
            checklist: p.checklist,
            isCustom: p.isCustom ? p : undefined
          };
        }
      });
      const photos = {};
      places.forEach((p) => {
        if (p.userPhotos && p.userPhotos.length > 0) photos[p.id] = p.userPhotos;
      });
      // Visits and notes are small: save them first, before the photos, so they are never lost when photos fill the storage
      localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides));
      localStorage.setItem(USER_PHOTOS_KEY, JSON.stringify(photos));
      storageWarnedRef.current = false;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.error('Tarayıcı depolama alanı doldu:', e);
        if (!storageWarnedRef.current) {
          storageWarnedRef.current = true;
          alert('⚠️ Tarayıcı hafızası (~5 MB) doldu! Gittiğin yerler ve notların kaydedildi, ama son eklediğin fotoğraf kaydedilmedi; sayfa yenilenince kaybolur. Bazı fotoğrafları sil ya da Bulut Eşleme (Supabase) kullan.');
        }
      } else {
        console.error('Overrides save error:', e);
      }
    }
  }, [places, isLoadingPlaces, shareView]);

  const autoSync = useAutoSync({ places, setPlaces, isLoadingPlaces, disabled: !!shareView });
  // The trip plan follows the user across devices too
  const tripSync = useDocSync({
    id: 'trip',
    value: tripDoc,
    setValue: (t) => {
      setTripPlanIds(Array.isArray(t?.ids) ? t.ids : []);
      setTripMeta({ days: t?.days || {}, name: t?.name || '', startDate: t?.startDate || '' });
    },
    isEmpty: (t) => t.ids.length === 0 && !t.name && !t.startDate,
    disabled: !!shareView
  });

  const handleShareMap = async () => {
    try {
      const link = await createShareLink(places);
      try {
        await navigator.clipboard.writeText(link);
        alert('🔗 Salt okunur paylaşım linkin kopyalandı! Gittiğin ve favori yerlerini gösterir; notların, puanların ve fotoğrafların paylaşılmaz.');
      } catch (e) {
        window.prompt('Paylaşım linkin (kopyala):', link);
      }
    } catch (e) {
      alert('Paylaşım linki oluşturulamadı: ' + e.message);
    }
  };

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
    const matches = places.filter((p) => {
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
      if (weekendEscapeFilter && !p.ankaraDistance?.isWeekendEscape) return false;
      if (visaFreeFilter && !p.visaStatus?.isVisaFree) return false;

      if (deferredSearchQuery.trim()) {
        return matchesSearch(getSearchIndex(p), deferredSearchQuery);
      }
      return true;
    });
    if (!deferredSearchQuery.trim()) return matches;
    // Places whose name, city or country holds the query come before places that only mention it
    const named = [];
    const mentioned = [];
    for (const p of matches) (matchesSearchKey(getSearchIndex(p), deferredSearchQuery) ? named : mentioned).push(p);
    return named.length ? named.concat(mentioned) : matches;
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
    weekendEscapeFilter,
    visaFreeFilter,
    deferredSearchQuery
  ]);

  // What the map shows after a search: the places named after the query, or all matches if none is.
  // It waits until the (deferred) list has caught up with the query, and fits once per search.
  const [searchFitTarget, setSearchFitTarget] = useState(null);
  const fittedSearchRef = useRef(null);
  useEffect(() => {
    if (!searchFitKey || fittedSearchRef.current === searchFitKey) return;
    if (deferredSearchQuery.trim() !== searchFitKey.q) return;
    fittedSearchRef.current = searchFitKey;
    const named = filteredPlaces.filter((p) => matchesSearchKey(getSearchIndex(p), searchFitKey.q));
    setSearchFitTarget({ places: named.length ? named : filteredPlaces });
  }, [searchFitKey, deferredSearchQuery, filteredPlaces]);

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
    const weekendCount = scopeList.filter((p) => p.ankaraDistance?.isWeekendEscape).length;
    const visaFreeCount = scopeList.filter((p) => p.visaStatus?.isVisaFree).length;
    const percent = total > 0 ? Math.round((visitedCount / total) * 100) : 0;
    return { total, visitedCount, todoCount, favoriteCount, weekendCount, visaFreeCount, percent };
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
      `gezginogi-yedek-${new Date().toISOString().slice(0, 10)}.json`
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
      localStorage.removeItem(USER_OVERRIDES_KEY);
      const basePath = import.meta.env.BASE_URL || '/';
      const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
      fetch(`${cleanBase}data/places.json`)
        .then((res) => res.json())
        .then((resetList) => {
          setPlaces(resetList);
          setSelectedPlaceId(resetList[0]?.id || null);
          setStatusFilter('todo');
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {shareView && (
        <div className="bg-indigo-600 text-white text-xs sm:text-sm px-4 py-2 flex flex-wrap items-center justify-center gap-2 text-center">
          <span>👀 Paylaşılan bir gezi haritasına bakıyorsun ({shareView.visited.size} gidilen yer). Salt okunur: burada yaptığın değişiklikler kaydedilmez.</span>
          <button onClick={leaveShareView} className="bg-white text-indigo-700 font-bold px-3 py-1 rounded-lg">
            Kendi haritama dön
          </button>
        </div>
      )}
      {/* ================= TOP NAVIGATION HEADER (LIGHT THEME) ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 lg:px-6 py-2 lg:py-2.5 shadow-xs">
        {/* Phones: logo and the lock button share the first row, the region switcher fills the second */}
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 lg:gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/15">
              <Compass className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-serif tracking-tight text-slate-900">
                  GezginOgi
                </h1>
                <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                  {places.length} Özel Rehber Noktası
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Ankara • Türkiye • Dünya İnteraktif Gezi Haritası & Seyahat Blogu
              </p>
            </div>
          </div>

          {/* Region Scope Switcher (Ankara / Türkiye / Balkanlar / Dünya) */}
          <div className="order-last lg:order-none w-full lg:w-auto flex items-center bg-slate-100 border border-slate-200/90 rounded-2xl p-1 gap-1 overflow-x-auto no-scrollbar shadow-xs">
            {REGIONS.map((reg) => {
              const count = places.filter((p) => matchesRegionScope(p, reg.id)).length;
              const isActive = activeRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => handleRegionChange(reg.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{reg.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Actions: View Mode, Surprise Me, Backup & Add Place */}
          <div className="hidden lg:flex flex-wrap justify-end items-center gap-2 min-w-0">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'split'
                    ? 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
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
                    ? 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
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
                    ? 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
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
                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs text-xs font-semibold transition"
              title="Akıllı Bavul & Seyahat Öncesi Kontrol Listesi"
            >
              <span>🎒</span>
              <span className="hidden xl:inline">Bavul Listesi</span>
            </button>

            {/* Currency & Budget Tracker Button */}
            <button
              onClick={() => setIsBudgetOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs text-xs font-semibold transition"
              title="Çoklu Para Birimi (BAM, RSD, ALL, MKD, EUR) ve Seyahat Bütçesi"
            >
              <span>💱</span>
              <span className="hidden xl:inline">Bütçe & Döviz</span>
            </button>

            {/* Traveler Toolbox Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setToolsAnchor({ top: r.bottom + 8, left: Math.max(16, Math.min(r.left, window.innerWidth - 304)) });
                  setIsToolsDropdownOpen(!isToolsDropdownOpen);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  isToolsDropdownOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                }`}
                title="Gezgin Alet Çantası: Sınır Kapıları, Yol Şarkıları, GPS Radar, Rota Simülatörü ve Konsolosluk"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">Gezgin Araçları</span>
                <span className="text-[10px] opacity-75">▾</span>
              </button>

            </div>

            {/* Passport Modal Button */}
            <button
              onClick={() => setIsPassportOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 shadow-xs text-xs font-semibold transition"
              title="Keşif Pasaportum, İstatistiklerim ve Rozetlerim"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">Pasaportum ({ places.filter(p => p.visited).length })</span>
            </button>

            {/* Surprise Me Button */}
            <button
              onClick={handleRandomSurprise}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-900 border border-purple-200 shadow-xs text-xs font-semibold transition"
              title="Bana henüz gitmediğim rastgele bir keşif noktası öner"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden lg:inline">Nereye Gitsem?</span>
            </button>

            {/* Bu Ay Nereye Gitsem Modal Button */}
            <button
              onClick={() => setIsSeasonalCalendarOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100/80 text-cyan-900 border border-cyan-200 shadow-xs text-xs font-semibold transition"
              title="12 Ay Mevsim Rehberi: Bu ay nereye gitmeli?"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden xl:inline">Bu Ay Nereye Gitsem?</span>
            </button>

            {/* Cloud Sync Button */}
            <button
              onClick={() => setIsCloudSyncOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100/80 text-sky-900 border border-sky-200 shadow-xs text-xs font-semibold transition"
              title="Cihazlar Arası Bulut Eşleme & Güvenlik PIN'i"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden lg:inline">Bulut Eşleme</span>
              <SyncDot status={autoSync.status} message={autoSync.message} />
            </button>

            {/* Export / Import Backup */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-xs">
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-white transition"
                title="Haritamı ve notlarımı yedekle (JSON İndir)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white transition"
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
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-white transition"
                title="Varsayılan mekanları sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Status / Cloud Sync Button */}
            <button
              onClick={() => setIsCloudSyncOpen(true)}
              className={`p-2 rounded-xl border transition shadow-xs ${
                isAdmin
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
              }`}
              title={isAdmin ? 'Yönetici Oturumu Açık (Bulut Eşleme & Yetki)' : 'Giriş Yap & Bulut Eşleme'}
            >
              {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            {/* Add New Place Button */}
            <button
              onClick={() => {
                setEditingPlace(null);
                setIsFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Yer Ekle</span>
            </button>
          </div>

          {/* Phone header actions ("Ekle" lives in the bottom bar) */}
          <div className="lg:hidden flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsCloudSyncOpen(true)}
              aria-label={isAdmin ? 'Yönetici açık, bulut eşleme' : 'Giriş yap ve bulut eşleme'}
              className={`relative p-2 rounded-xl border transition ${
                isAdmin
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-slate-500 border-slate-200'
              }`}
              title={isAdmin ? 'Yönetici Açık' : 'Giriş Yap'}
            >
              {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span className="absolute -top-0.5 -right-0.5"><SyncDot status={autoSync.status} message={autoSync.message} /></span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= FILTER & PROGRESS BAR ================= */}
      <section className="bg-white/80 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 py-2 space-y-2">
        {activeRegion === 'balkanlar' && (
          <div className="max-w-[1800px] mx-auto bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-lg">🌸</span>
              <div>
                <strong className="text-emerald-800 font-bold">
                  Nisan Ayı Balkanlar Özel Planlayıcısı:
                </strong>{' '}
                <span className="text-slate-700">
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
                    : 'bg-emerald-100/70 text-emerald-800 border-emerald-300 hover:bg-emerald-200/70'
                }`}
              >
                {activeSubRegion === 'Balkanlar (Nisan Özel)' ? '✓ Sadece Nisan Özel Rotaları Gösteriliyor' : '✨ Sadece Nisan Özel Eklemelerini Filtrele'}
              </button>
            </div>
          </div>
        )}
        {/* Ultra-Clean Single-Row Primary Toolbar */}
        {/* Mobile Ultra-Compact Single-Row Control Bar (Leaves >80% screen to Map!) */}
        <div className="lg:hidden flex items-center gap-1.5 max-w-[1800px] mx-auto">
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mekan veya şehir ara..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Location Button */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs text-amber-900 font-bold flex items-center gap-1 shrink-0"
            title="Ülke ve Şehir Arama"
          >
            <span>🌍</span>
            <span className="truncate max-w-[75px]">
              {activeCountry === 'all' ? 'Ülke' : activeCountry}
            </span>
          </button>

          {/* Mobile Master Filter Button */}
          <button
            onClick={() => setIsMobileFilterDrawerOpen(true)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition shrink-0 ${
              activeCategory !== 'all' || activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter !== 'todo'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtre</span>
            {(activeCategory !== 'all' || activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter !== 'todo') && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            )}
          </button>
        </div>

        {/* Ultra-Clean Single-Row Primary Toolbar (Desktop) */}
        <div className="hidden lg:flex max-w-[1800px] mx-auto flex-wrap items-center justify-between gap-2">
          {/* Category Chips (Smooth Horizontal Scroll) */}
          <div className="min-w-0 flex-1 basis-[320px] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Tools: Search + Country Modal + Status Switcher + Expand Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mekan, şehir ara..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>

            {/* Location Selector Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="bg-amber-50 border border-amber-300 hover:bg-amber-100/70 rounded-xl px-2.5 py-1 text-xs text-amber-900 font-bold flex items-center gap-1.5 transition shadow-xs shrink-0"
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
              <span className="text-[10px] text-amber-700">▾</span>
            </button>

            {/* Quick clear city button if a city is active */}
            {activeCity !== 'all' && (
              <button
                onClick={() => setActiveCity('all')}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl px-2 py-1 text-[11px] font-semibold flex items-center gap-1 transition"
                title="Şehir filtresini kaldır, tüm ülkeyi göster"
              >
                <span>{activeCity}</span>
                <X className="w-3 h-3 text-amber-800" />
              </button>
            )}

            {/* Visited Status Filter: Keşfedilecekler vs Gittiklerim */}
            <div className="bg-slate-100 border border-slate-200/90 rounded-xl p-0.5 flex items-center text-[11px] font-semibold shrink-0">
              <button
                onClick={() => setStatusFilter('todo')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === 'todo'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gittiklerim Listesi: İşaretlediğin yerler"
              >
                <span>✅</span>
                <span>Gittiklerim ({stats.visitedCount})</span>
              </button>
            </div>

            {/* Quick Toggle: Hafta Sonu Kaçamağı (Ankara < 4.5 saat) */}
            <button
              onClick={() => setWeekendEscapeFilter(!weekendEscapeFilter)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                weekendEscapeFilter
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Ankara'dan 4.5 saatten yakın araba ve trenle ulaşılan kaçamak rotaları"
            >
              <span>🚗</span>
              <span className="hidden sm:inline">Hafta Sonu</span>
              <span>({stats.weekendCount})</span>
            </button>

            {/* Quick Toggle: Bu mevsim hafta sonu kaçamakları (Hafta Sonu + bu mevsim) */}
            {(() => {
              const season = currentSeasonId();
              const active = weekendEscapeFilter && seasonFilter === season;
              return (
                <button
                  onClick={() => {
                    setWeekendEscapeFilter(!active);
                    setSeasonFilter(active ? 'all' : season);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                    active
                      ? 'bg-teal-600 text-white border-teal-500 shadow-xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Ankara'dan hafta sonuna sığan ve tam bu mevsimde gidilecek yerler"
                >
                  <span>🗓️</span>
                  <span>Bu Mevsim Hafta Sonu</span>
                </button>
              );
            })()}

            {/* Quick Toggle: Sadece Vizesiz Ülkeler */}
            <button
              onClick={() => setVisaFreeFilter(!visaFreeFilter)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                visaFreeFilter
                  ? 'bg-sky-600 text-white border-sky-500 shadow-xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Sadece Türk vatandaşlarına vizesiz veya kimlikle girilebilen destinasyonlar"
            >
              <span>🛂</span>
              <span className="hidden sm:inline">Sadece Vizesiz</span>
              <span>({stats.visaFreeCount})</span>
            </button>

            {/* Offline PWA Status Badge */}
            {!isOnline && (
              <div
                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-amber-400 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0 animate-pulse"
                title="İnternet bağlantısı kesildi. GezginOgi yerel önbellekten (Service Worker) internetsiz çalışıyor."
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Çevrimdışı Mod</span>
              </div>
            )}

            {/* Detaylı Filtreler Toggle Button */}
            <button
              onClick={() => setIsExtraFiltersOpen(!isExtraFiltersOpen)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition shrink-0 ${
                isExtraFiltersOpen || activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter === 'favorite'
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Kıta/Bölge, Mevsim, Süre ve Favori Filtrelerini Aç/Kapat"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtreler</span>
              {(activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter === 'favorite') && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>
        </div>

        {/* Compact Expandable Secondary Filter Row (Only when opened or filter active) */}
        {(isExtraFiltersOpen || activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || statusFilter === 'favorite' || tripPlanIds.length > 0) && (
          <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* SubRegion Dropdown (Replaces 15 cluttered buttons) */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Bölge:</span>
                <select
                  value={activeSubRegion}
                  onChange={(e) => setActiveSubRegion(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-400 cursor-pointer max-w-[170px] truncate shadow-xs"
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
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-400 shadow-xs"
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
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-400 shadow-xs"
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
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>★</span>
                <span>Favoriler ({stats.favoriteCount})</span>
              </button>

              {/* Clear All Filters */}
              {(activeSubRegion !== 'all' || seasonFilter !== 'all' || durationFilter !== 'all' || weekendEscapeFilter || visaFreeFilter || statusFilter !== 'todo' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveSubRegion('all');
                    setActiveCountry('all');
                    setActiveCity('all');
                    setActiveCategory('all');
                    setStatusFilter('todo');
                    setSeasonFilter('all');
                    setDurationFilter('all');
                    setWeekendEscapeFilter(false);
                    setVisaFreeFilter(false);
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-amber-600 hover:text-amber-800 font-medium hover:underline px-1 py-0.5"
                >
                  Filtreleri Sıfırla
                </button>
              )}
            </div>

            {/* Active Trip Route Quick Bar */}
            {tripPlanIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1 text-xs max-w-full">
                <Route className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-800 font-semibold">
                  Gezi Rotam ({tripPlanIds.length} Durak{tripTotalKm > 0 ? `, ~${formatKm(tripTotalKm)}` : ''}):
                </span>
                <div className="flex items-center gap-1 overflow-x-auto min-w-0 max-w-full sm:max-w-md">
                  {tripPlanIds.map((id, i) => {
                    const pl = places.find((p) => p.id === id);
                    if (!pl) return null;
                    return (
                      <span
                        key={id}
                        onClick={() => handleSelectPlace(pl)}
                        className="cursor-pointer bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap hover:text-amber-600 shadow-xs"
                      >
                        {i + 1}. {pl.name.split(':')[0].split('&')[0]}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setIsItineraryOpen(true)}
                  className="text-rose-700 hover:text-rose-900 font-semibold underline whitespace-nowrap"
                >
                  Günlere ayır
                </button>
                <button
                  onClick={() => setTripPlanIds([])}
                  className="text-rose-600 hover:text-rose-900 ml-1"
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
      <main className="main-above-bottom-bar flex-1 max-w-[1800px] w-full mx-auto p-2 sm:p-4 lg:p-5 overflow-hidden lg:pb-4">
        {/* On phones the bottom bar switches between map and list, so there is no switcher here */}

        {/* MODE 1: SPLIT VIEW (Places List + Active Detail + Interactive Map) */}
        {viewMode === 'split' && (
          <div
            ref={splitRef}
            style={splitHeight ? { height: splitHeight } : undefined}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            {/* Left Column: Places List (Visible on desktop OR when mobileTab === 'list') */}
            <div
              className={`${
                mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
              } lg:col-span-4 xl:col-span-3 bg-white border border-slate-200/90 rounded-2xl flex-col overflow-hidden h-full shadow-xs`}
            >
              <div className="px-4 py-2.5 border-b border-slate-200/90 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {statusFilter === 'todo'
                    ? '🧭 Keşfedilecekler'
                    : statusFilter === 'visited'
                    ? '✅ Gittiklerim Listesi'
                    : statusFilter === 'favorite'
                    ? '★ Favoriler'
                    : 'Keşif Noktaları'}{' '}
                  ({filteredPlaces.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  {statusFilter === 'todo' ? 'Gittikçe listeden düşer' : '✓ Gittim • + Rota'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {filteredPlaces.length === 0 ? (
                  <div className="text-center py-12 px-4 text-slate-500 space-y-3">
                    <Filter className="w-8 h-8 mx-auto text-slate-400" />
                    {statusFilter === 'visited' ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Henüz 'Gittim' dediğin bir yer yok.</p>
                        <p className="text-xs text-slate-500 mt-1">
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
                      className="text-xs text-amber-600 underline font-semibold"
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
                              ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                              : 'bg-white border-slate-200/85 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-slate-100 to-amber-50 border border-slate-200/90 flex items-center justify-center">
                            {coverOf(place) ? (
                              <img
                                src={getOptimizedImageUrl(coverOf(place), 500)} loading="lazy" decoding="async"
                                alt={place.name}
                                className={`w-full h-full object-cover ${
                                  place.visited ? 'opacity-65 saturate-50' : ''
                                }`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span
                              className="text-xl"
                              style={{ display: coverOf(place) ? 'none' : 'block' }}
                            >
                              {catObj.icon}
                            </span>
                            {coverOf(place) && (
                              <span className="absolute bottom-1 right-1 text-xs bg-white/90 text-slate-800 border border-slate-200 rounded px-1 shadow-2xs">
                                {catObj.icon}
                              </span>
                            )}
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
                                    : 'text-slate-800 group-hover:text-amber-600'
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
                                      ? 'text-rose-600 bg-rose-50'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
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
                                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                      : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
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

                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {place.city}
                            </div>

                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600 flex-wrap">
                              {place.ankaraDistance?.summaryText && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/90 px-1.5 py-0.5 rounded font-medium">
                                  <span>🚗</span>
                                  <span>{place.ankaraDistance.summaryText.replace('Ankara’dan ', '')}</span>
                                </span>
                              )}
                              {place.ankaraDistance?.isWeekendEscape && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                  🌿 Hafta Sonu
                                </span>
                              )}
                              {place.country !== 'Türkiye' && place.visaStatus && (
                                <span className={`px-1.5 py-0.5 rounded font-bold border ${place.visaStatus.badgeClass}`}>
                                  {place.visaStatus.icon} {place.visaStatus.label}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {place.duration}
                              </span>
                              {place.visited && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
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
                          className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-xs"
                        >
                          Daha Fazla Göster (+120) • Kalan: {filteredPlaces.length - visibleLimit}
                        </button>
                        <button
                          onClick={() => setVisibleLimit(filteredPlaces.length)}
                          className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition"
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
              } lg:col-span-8 xl:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-4 h-full overflow-hidden relative`}
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
                  fitKey={searchFitTarget}
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
                  className="lg:hidden absolute bottom-4 left-1/2 -translate-y-0 -translate-x-1/2 z-[400] bg-white/95 text-slate-800 border border-slate-200 shadow-xl px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md active:scale-95 transition"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
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
                    onOpenCountryIntel={(c) => setSelectedCountryIntel(c)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Tablet Slide-Up Detail Modal (xl:hidden) */}
        {selectedPlace && isMobileDetailOpen && (
          <div className="xl:hidden fixed inset-0 z-[650] bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-2xl h-[92vh] sm:h-[86vh] bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col animate-slideUp">
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
                onOpenCountryIntel={(c) => setSelectedCountryIntel(c)}
              />
            </div>
          </div>
        )}

        {/* Mobile Bottom Quick Navigation Bar (Fixed bottom for phone screens) */}
        <nav ref={bottomBarRef} aria-label="Alt menü" className="safe-bottom-bar lg:hidden fixed bottom-0 left-0 right-0 z-[450] bg-white/95 border-t border-slate-200 backdrop-blur-xl px-1 flex items-stretch shadow-2xl">
          <button
            onClick={() => setMobileTab('map')}
            aria-current={mobileTab === 'map' ? 'page' : undefined}
            className={`flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition ${
              mobileTab === 'map' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Harita</span>
          </button>
          <button
            onClick={() => setMobileTab('list')}
            aria-current={mobileTab === 'list' ? 'page' : undefined}
            className={`flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition ${
              mobileTab === 'list' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Liste ({filteredPlaces.length})</span>
          </button>
          <button
            onClick={() => {
              setToolsAnchor(null);
              setIsToolsDropdownOpen(true);
            }}
            className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-amber-600 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Araçlar</span>
          </button>
          <button
            onClick={() => setIsPassportOpen(true)}
            className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-amber-600 transition"
          >
            <Award className="w-4 h-4" />
            <span>Pasaport</span>
          </button>
          <button
            onClick={() => {
              setEditingPlace(null);
              setIsFormOpen(true);
            }}
            className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-amber-600 active:scale-90 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ekle</span>
          </button>
        </nav>

        {/* MODE 2: BLOG & TRAVEL MAGAZINE VIEW */}
        {viewMode === 'blog' && (
          <div className="space-y-6 pb-12">
            {/* Blog Hero Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kişisel Gezi Rehberi & Seyahat Blogu ({filteredPlaces.length} Makale)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  Ankara’dan Dünyaya Keşif Notlarım
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Her durağın ne kadar sürede gezileceği, içeride seni nelerin beklediği, hangi mevsimde gidileceği, yöresel lezzetleri ve kendi anıların tek bir sayfada.
                </p>
              </div>

              <button
                onClick={() => setViewMode('split')}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 shadow-xs"
              >
                <MapIcon className="w-4 h-4 text-amber-600" />
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
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col hover:border-slate-300 transition"
                  >
                    {/* Card Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/60 flex items-center justify-center">
                      {coverOf(place) ? (
                        <img
                          src={getOptimizedImageUrl(coverOf(place), 960)} loading="lazy" decoding="async"
                          alt={place.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div
                        className="text-center p-4"
                        style={{ display: coverOf(place) ? 'none' : 'block' }}
                      >
                        <span className="text-5xl block">{catObj.icon}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${catObj.bg}`}
                        >
                          {catObj.icon} {catObj.label}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs bg-white/90 text-slate-800 border border-slate-200 font-medium shadow-2xs backdrop-blur-xs">
                          {regObj.flag} {place.city}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleVisited(place.id)}
                        className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition ${
                          place.visited
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-white/90 text-slate-800 hover:bg-amber-500 hover:text-slate-950'
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
                          className={`text-xl font-serif font-bold text-white drop-shadow-md ${
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
                          {place.ankaraDistance?.summaryText && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold">
                              <span>🚗</span>
                              <span>{place.ankaraDistance.summaryText}</span>
                            </span>
                          )}
                          {place.ankaraDistance?.isWeekendEscape && (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold shadow-2xs">
                              🌿 Hafta Sonu Kaçamağı
                            </span>
                          )}
                          {place.country !== 'Türkiye' && place.visaStatus && (
                            <span
                              onClick={() => setSelectedCountryIntel(place.country)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border cursor-pointer hover:opacity-90 ${place.visaStatus.badgeClass}`}
                              title="Ülke rehberini aç"
                            >
                              <span>{place.visaStatus.icon}</span>
                              <span>{place.visaStatus.label}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Süre: {place.duration}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {(place.seasons || [])
                              .map((s) => SEASONS.find((x) => x.id === s)?.label)
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>

                        {/* What Awaits */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                            ✨ İçeride Seni Neler Bekliyor?
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {place.whatAwaits}
                          </p>
                        </div>

                        {/* Local Specialties */}
                        <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3">
                          <h4 className="text-xs font-bold text-orange-900 flex items-center gap-1.5 mb-1">
                            <Utensils className="w-3.5 h-3.5 text-orange-600" />
                            <span>Yöresel Lezzet & Yakın Duraklar</span>
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {place.localSpecialties}
                          </p>
                        </div>

                        {/* Blog Story */}
                        {place.blogArticle && (
                          <div className="border-l-2 border-amber-400 pl-3.5 py-1 bg-amber-50/40 rounded-r-lg">
                            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed line-clamp-4">
                              "{place.blogArticle}"
                            </p>
                          </div>
                        )}

                        {/* Personal Journal Note */}
                        {place.userNotes && (
                          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950">
                            <strong className="block text-amber-900 mb-0.5">
                              📝 Benim Gezi Notum:
                            </strong>
                            {place.userNotes}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            handleSelectPlace(place);
                            setViewMode('split');
                          }}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                          <span>Haritada Göster & Tam Rehberi Oku</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingPlace(place);
                            setIsFormOpen(true);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-700"
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
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition"
                >
                  Daha Fazla Makale Göster (+120) • Kalan: {filteredPlaces.length - visibleLimit}
                </button>
                <button
                  onClick={() => setVisibleLimit(filteredPlaces.length)}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition"
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
              fitKey={searchFitTarget}
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
                  onOpenCountryIntel={(c) => setSelectedCountryIntel(c)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <Suspense fallback={null}>
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
        tripMeta={tripMeta}
        onSetTripMeta={setTripMeta}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenPacking={() => setIsPackingOpen(true)}
      />

      {/* Traveler tools menu: rendered at the root so the phone bottom bar can open it too */}
        {isToolsDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-[540] bg-slate-950/60 lg:bg-transparent"
              onClick={() => setIsToolsDropdownOpen(false)}
            />
            <div
              style={toolsAnchor ? { top: toolsAnchor.top, left: toolsAnchor.left } : undefined}
              className={`fixed max-h-[75vh] overflow-y-auto ${toolsAnchor ? "w-72" : "bottom-16 left-4 right-4"} bg-white border border-slate-300 rounded-2xl shadow-2xl p-2.5 z-[550] animate-fadeIn space-y-1 text-slate-800`}
              onClick={() => setIsToolsDropdownOpen(false)}
            >
            <button
              onClick={handleShareMap}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">🔗</span>
              <div>
                <strong className="block text-slate-900">Haritamı Paylaş (Salt Okunur)</strong>
                <span className="text-[10px] text-slate-500">Gittiğin yerleri link ile göster; notlar paylaşılmaz</span>
              </div>
            </button>

            <button
              onClick={() => setIsCloudSyncOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">☁️</span>
              <div>
                <strong className="block text-slate-900">Bulut Senkronizasyon & PIN</strong>
                <span className="text-[10px] text-slate-500">Telefon ve bilgisayarı canlı eşitle</span>
              </div>
            </button>

            <button
              onClick={() => setIsSeasonalCalendarOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">🗓️</span>
              <div>
                <strong className="block text-slate-900">Bu Ay Nereye Gitsem? (12 Ay)</strong>
                <span className="text-[10px] text-slate-500">Mevsimsel hava durumu ve ideal kaçış rotaları</span>
              </div>
            </button>

            <button
              onClick={() => setIsBorderOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">🚗</span>
              <div>
                <strong className="block text-slate-900">Balkan Sınır Kapıları & Vinyet</strong>
                <span className="text-[10px] text-slate-500">Canlı süreler, taktikler, otoyol pulları</span>
              </div>
            </button>

            <button
              onClick={() => setIsSoundtrackOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">🎵</span>
              <div>
                <strong className="block text-slate-900">Yolun Şarkıları & Ambiyans</strong>
                <span className="text-[10px] text-slate-500">Sevdalinka, Akdeniz ezgileri, canlı yağmur</span>
              </div>
            </button>

            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">🗺️</span>
              <div>
                <strong className="block text-slate-900">İnteraktif Rota Simülatörü</strong>
                <span className="text-[10px] text-slate-500">Duraklar arası canlı yol animasyonu & km</span>
              </div>
            </button>

            <button
              onClick={() => setIsNearbyRadarOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">📍</span>
              <div>
                <strong className="block text-slate-900">Bana En Yakın Noktalar (GPS)</strong>
                <span className="text-[10px] text-slate-500">Bulunduğun yere göre canlı mesafe & pusula</span>
              </div>
            </button>

            <button
              onClick={() => setIsScratchMapOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition"
            >
              <span className="text-base">🎨</span>
              <div>
                <strong className="block text-slate-900">Kazı-Kazan Dünya & Fetih Atlası</strong>
                <span className="text-[10px] text-slate-500">Ülke fetih oranları ve seyahat karnen</span>
              </div>
            </button>

            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 transition border-t border-slate-100 pt-2"
            >
              <span className="text-base">🚨</span>
              <div>
                <strong className="block text-rose-800">Acil Durum & T.C. Konsolosluk</strong>
                <span className="text-[10px] text-slate-500">7/24 nöbetçi hatlar, polis, pasaport kaybı</span>
              </div>
            </button>
          </div>
        </>
        )}

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
        onClose={() => {
          setIsCloudSyncOpen(false);
          if (!shareView) {
            autoSync.syncNow();
            tripSync.syncNow();
          }
        }}
        places={places}
        onUpdatePlaces={(updatedPlaces) => {
          setPlaces(updatedPlaces);
        }}
        isAdmin={isAdmin}
        adminPin={adminPin}
        onSetAdminPin={handleSetAdminPin}
      />

      {/* ================= COUNTRY PRACTICAL INTEL MODAL ================= */}
      <CountryIntelModal
        isOpen={Boolean(selectedCountryIntel)}
        onClose={() => setSelectedCountryIntel(null)}
        countryName={selectedCountryIntel}
      />

      {/* ================= MOBILE FILTER DRAWER SHEET ================= */}
      {isMobileFilterDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[600] bg-slate-950/50 backdrop-blur-xs flex items-end animate-fadeIn">
          <div className="w-full bg-white rounded-t-3xl border-t border-slate-200 max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Filtreler & Kategoriler</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Durum</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('todo')}
                  className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                    statusFilter === 'todo' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>🧭</span> Keşfedilecekler ({stats.todoCount})
                </button>
                <button
                  onClick={() => setStatusFilter('visited')}
                  className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                    statusFilter === 'visited' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>✅</span> Gittiklerim ({stats.visitedCount})
                </button>
              </div>
            </div>

            {/* Quick Smart Filters: Hafta Sonu & Vizesiz */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hızlı Filtreler</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setWeekendEscapeFilter(!weekendEscapeFilter)}
                  className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    weekendEscapeFilter
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>🚗</span> Hafta Sonu ({stats.weekendCount})
                </button>
                <button
                  onClick={() => setVisaFreeFilter(!visaFreeFilter)}
                  className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    visaFreeFilter
                      ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>🛂</span> Vizesiz ({stats.visaFreeCount})
                </button>
                {(() => {
                  const season = currentSeasonId();
                  const active = weekendEscapeFilter && seasonFilter === season;
                  return (
                    <button
                      onClick={() => {
                        setWeekendEscapeFilter(!active);
                        setSeasonFilter(active ? 'all' : season);
                      }}
                      className={`col-span-2 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                        active
                          ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>🗓️</span> Bu Mevsim Hafta Sonu Kaçamakları
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kategoriler</label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                      activeCategory === cat.id ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary: SubRegion & Season */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bölge</label>
                <select
                  value={activeSubRegion}
                  onChange={(e) => setActiveSubRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                >
                  <option value="all">Tüm Bölgeler</option>
                  {availableSubRegions.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mevsim</label>
                <select
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                >
                  <option value="all">Tüm Mevsimler</option>
                  {SEASONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
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
                  setIsMobileFilterDrawerOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Sıfırla
              </button>
              <button
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs"
              >
                Filtreleri Uygula ({filteredPlaces.length} Yer)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Fresh Data Update Notification */}
      {updateNotification && (
        <div className="fixed bottom-16 lg:bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-slate-900/95 text-white border border-amber-400 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">
            Yer verileri güncellendi ({updateNotification.newLen} yer)
          </span>
          <button
            onClick={() => handleApplyUpdate(updateNotification.freshRaw, updateNotification.version)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-xl transition shadow-xs"
          >
            Şimdi Yenile
          </button>
        </div>
      )}
      </Suspense>
    </div>
  );
}
