import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { Palette } from '@/constants/theme';

export type Store = {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
};

export type MapHandle = {
  /** Géocode la requête (Nominatim/OSM) et recentre la carte dessus. */
  search: (query: string) => void;
  /** Recentre la carte sur des coordonnées (ex. un magasin). */
  focus: (lat: number, lng: number) => void;
};

type MapViewProps = {
  stores: Store[];
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Notifié quand une recherche aboutit (true) ou échoue (false). */
  onSearchResult?: (found: boolean) => void;
  /** Notifié quand un pin de magasin est touché (avec sa marque). */
  onStorePress?: (brand: string) => void;
};

function buildHtml(stores: Store[], center: { lat: number; lng: number }, zoom: number): string {
  const storesJson = JSON.stringify(stores);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #e7ecee; }
    .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.7); }
    .bio-pin { background: transparent; border: none; }
    .leaflet-popup-content { font-family: -apple-system, Roboto, sans-serif; font-size: 13px; }
    .leaflet-popup-content b { color: ${Palette.mapPin}; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${center.lat}, ${center.lng}], ${zoom});

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    var pinSvg =
      '<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 0C9 0 0 8.5 0 19c0 13 20 29 20 29s20-16 20-29C40 8.5 31 0 20 0z" fill="${Palette.mapPin}"/>' +
      '<circle cx="20" cy="18" r="12.5" fill="#ffffff"/>' +
      '<path d="M14 17.5 h12 l-1 9.2 a2 2 0 0 1 -2 1.8 h-6 a2 2 0 0 1 -2 -1.8 z" fill="${Palette.mapPin}"/>' +
      '<path d="M16.6 17.5 v-1.4 a3.4 3.4 0 0 1 6.8 0 v1.4" fill="none" stroke="${Palette.mapPin}" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>';

    var bioIcon = L.divIcon({
      html: pinSvg,
      className: 'bio-pin',
      iconSize: [40, 48],
      iconAnchor: [20, 47],
      popupAnchor: [0, -44]
    });

    var stores = ${storesJson};
    stores.forEach(function (s) {
      L.marker([s.lat, s.lng], { icon: bioIcon })
        .addTo(map)
        .on('click', function () { post({ type: 'store', brand: s.brand }); });
    });

    function post(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    window.focusPlace = function (lat, lng) {
      map.flyTo([lat, lng], 15);
    };

    var searchMarker = null;
    window.searchPlace = function (q) {
      if (!q) return;
      fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q), {
        headers: { 'Accept-Language': 'fr' }
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.length) {
            var lat = parseFloat(d[0].lat), lon = parseFloat(d[0].lon);
            map.flyTo([lat, lon], 14);
            if (searchMarker) { map.removeLayer(searchMarker); }
            searchMarker = L.marker([lat, lon]).addTo(map).bindPopup(d[0].display_name).openPopup();
            post({ type: 'search', found: true });
          } else {
            post({ type: 'search', found: false });
          }
        })
        .catch(function () { post({ type: 'search', found: false }); });
    };
  </script>
</body>
</html>`;
}

export const MapView = forwardRef<MapHandle, MapViewProps>(function MapView(
  { stores, center = { lat: 51.508, lng: -0.18 }, zoom = 12, onSearchResult, onStorePress },
  ref
) {
  const webRef = useRef<WebView>(null);
  const html = useMemo(() => buildHtml(stores, center, zoom), [stores, center, zoom]);

  useImperativeHandle(ref, () => ({
    search: (query: string) => {
      webRef.current?.injectJavaScript(`window.searchPlace(${JSON.stringify(query)}); true;`);
    },
    focus: (lat: number, lng: number) => {
      webRef.current?.injectJavaScript(`window.focusPlace(${lat}, ${lng}); true;`);
    },
  }));

  return (
    <WebView
      ref={webRef}
      style={styles.web}
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data?.type === 'search') {
            onSearchResult?.(Boolean(data.found));
          } else if (data?.type === 'store') {
            onStorePress?.(String(data.brand));
          }
        } catch {
          // message non JSON — ignoré
        }
      }}
    />
  );
});

const styles = StyleSheet.create({
  web: {
    flex: 1,
    backgroundColor: '#e7ecee',
  },
});
