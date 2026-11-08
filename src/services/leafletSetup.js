// leaflet.markercluster attaches itself to a global `L`, so expose Leaflet before it loads.
// Import Leaflet from this module (not 'leaflet') wherever clustering is used.
import L from 'leaflet';

if (typeof window !== 'undefined') window.L = L;

export default L;
