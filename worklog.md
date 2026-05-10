---
Task ID: 2
Agent: main
Task: Replace Optomap heatmaps with pinpoint markers + zoom-based clustering

Work Log:
- Explored entire MapContainer.tsx (1128 lines) and MiniOptoMap.tsx (423 lines)
- Installed react-leaflet-cluster@4.1.3 for proper zoom-based marker clustering
- Rewrote MapContainer.tsx: removed HeatmapLayer (custom canvas), removed manual country cluster circles, removed spreadOverlappingMarkers and isRawCoordinate functions
- Added MarkerClusterGroup from react-leaflet-cluster wrapping all individual markers
- Created createClusterIcon function: dynamic sizing by count (40-70px), colored by dominant type (teal/amber/emerald)
- Added ClusterStyles component for CSS injection to hide default leaflet backgrounds
- Kept all existing features: marker icons (optometrist/student/clinic SVG), DetailPanel, MobileBottomSheet, ProfilePopup, MapLegend, filtering, search
- Updated MiniOptoMap.tsx: removed DensityHeatmapLayer, added small 8px colored circle markers + MarkerClusterGroup with mini cluster icons
- Replaced "Density" legend with "Pins" legend on mini map
- All lint checks pass, server running on port 3000

Stage Summary:
- Heatmaps completely removed from both main OptoMap and MiniOptoMap
- Pinpoint markers now used everywhere with proper clustering
- As users zoom out, pins merge into cluster bubbles showing total count
- As users zoom in, clusters break apart into individual pins
- Members without specific area/state/district naturally cluster together at country level
- Members with details show as individual pinpoint markers
- Click cluster to zoom in and expand; spiderfy at max zoom
