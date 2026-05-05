import Globe from 'globe.gl';

const hubs = [
  {
    title: 'Brazil',
    label: 'Brazil: government-aligned vs. opposition media',
    href: '/brazil',
    lat: -14.235,
    lng: -51.925,
    match: feat => feat.properties.ISO_A2 === 'BR' || feat.properties.NAME === 'Brazil'
  },
  {
    title: 'Nicaragua',
    label: 'Nicaragua: government-aligned vs. opposition media',
    href: '/nicaragua',
    lat: 12.865,
    lng: -85.207,
    match: feat => feat.properties.ISO_A2 === 'NI' || feat.properties.NAME === 'Nicaragua'
  },
  {
    title: 'Venezuela',
    label: 'Venezuela: government-aligned vs. opposition media',
    href: '/venezuela',
    lat: 6.423,
    lng: -66.589,
    match: feat => feat.properties.ISO_A2 === 'VE' || feat.properties.NAME === 'Venezuela'
  },
  {
    title: 'Europe',
    label: 'Europe: elite vs. populist media',
    href: '/europe',
    lat: 51.165,
    lng: 10.451,
    match: feat => feat.properties.CONTINENT === 'Europe' && feat.properties.NAME !== 'Russia'
  },
  {
    title: 'United States',
    label: 'United States: left-aligned vs. right-aligned media',
    href: '/united-states',
    lat: 39.828,
    lng: -98.579,
    match: feat => feat.properties.ISO_A2 === 'US' || feat.properties.ISO_A3 === 'USA' || feat.properties.NAME === 'United States of America'
  }
];

const initGlobe = () => {
  const container = document.getElementById('globe-container');
  if (!container) return;

  let activeHub = null;

  const globe = Globe()(container)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg') // Dark realistic night look
    .backgroundColor('rgba(0,0,0,0)')
    // Core points
    .pointsData(hubs)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor(() => '#0072FC')
    .pointAltitude(0.01)
    .pointRadius(0.5)
    .pointsMerge(false)
    // Pulsing rings
    .ringsData(hubs)
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => '#0072FC')
    .ringMaxRadius(3)
    .ringPropagationSpeed(1)
    .ringRepeatPeriod(1000)
    // 3D labels for proper occlusion behind the globe
    .labelsData(hubs)
    .labelLat('lat')
    .labelLng('lng')
    .labelText('title')
    .labelSize(1.5)
    .labelDotRadius(0.3)
    .labelColor(() => 'rgba(255, 255, 255, 0.9)')
    .labelResolution(2)
    .labelAltitude(0.02)
    .onLabelClick(d => toggleHub(d))
    .onPointClick(d => toggleHub(d))
    .onGlobeClick(() => clearHub());

  // Load and configure polygons to clearly show landmasses and highlight countries
  fetch('//unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
    .then(res => res.json())
    .then(countries => {
      globe.polygonsData(countries.features)
        .polygonAltitude(0.005)
        .polygonCapColor(feat => {
          if (activeHub && activeHub.match(feat)) {
            return 'rgba(0, 114, 252, 0.6)'; // Highlight color
          }
          return 'rgba(255, 255, 255, 0.02)'; // Very subtle default land color
        })
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(feat => {
          if (activeHub && activeHub.match(feat)) {
            return '#0072FC'; // Border highlight
          }
          return 'rgba(255, 255, 255, 0.05)'; // Default subtle country border
        })
        .polygonsTransitionDuration(300);
    });

  const updateSidebar = () => {
    document.querySelectorAll('.region-item').forEach(link => {
      if (activeHub && link.getAttribute('data-href') === activeHub.href) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const initialPosition = { lat: 20, lng: -40, altitude: 2 };

  const clearHub = () => {
    if (!activeHub) return;
    activeHub = null;

    // Clear highlights
    globe.polygonCapColor(globe.polygonCapColor())
      .polygonStrokeColor(globe.polygonStrokeColor());

    // Reset camera and resume rotation
    globe.pointOfView(initialPosition, 1000);
    globe.controls().autoRotate = true;

    updateSidebar();
  };

  const toggleHub = (hub) => {
    if (activeHub === hub) {
      clearHub();
      return;
    }

    activeHub = hub;

    // Update highlights
    globe.polygonCapColor(globe.polygonCapColor())
      .polygonStrokeColor(globe.polygonStrokeColor());

    // Zoom and stop rotation
    globe.pointOfView({ lat: hub.lat, lng: hub.lng, altitude: 1.2 }, 1000);
    globe.controls().autoRotate = false;

    updateSidebar();
  };

  // Bind sidebar links to toggle the country on click
  document.querySelectorAll('.region-item').forEach(link => {
    const header = link.querySelector('.region-item-header');
    if (header) {
      header.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('data-href');
        const hub = hubs.find(h => h.href === href);
        if (hub) {
          toggleHub(hub);
        }
      });
    }
  });

  // Custom atmosphere
  globe.atmosphereColor('#0072FC').atmosphereAltitude(0.15);

  // Auto-rotate
  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.5;
  globe.controls().enableZoom = false; // Disable zoom

  // Set initial position
  globe.pointOfView(initialPosition);

  // Handle resize
  const resizeGlobe = () => {
    if (container) {
      globe.width(container.clientWidth);
      globe.height(container.clientHeight);
    }
  };
  window.addEventListener('resize', resizeGlobe);
};

document.addEventListener('DOMContentLoaded', initGlobe);
