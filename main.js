import Globe from 'globe.gl';

const hubs = [
  {
    title: 'Brazil',
    subtitle: 'Government-aligned vs. Opposition',
    label: 'Brazil: government-aligned vs. opposition media',
    description: 'Compare how state-aligned and opposition media frame the same events across Brazilian politics and society.',
    href: '/brazil',
    externalUrl: 'https://layer3.news/posts/subjects/brazil',
    flag: '/flags/br.png',
    heroImage: '/hubs/brazil_footage.png',
    lat: -14.235,
    lng: -51.925,
    match: feat => feat.properties.ISO_A2 === 'BR' || feat.properties.NAME === 'Brazil'
  },
  {
    title: 'Nicaragua',
    subtitle: 'Government-aligned vs. Opposition',
    label: 'Nicaragua: government-aligned vs. opposition media',
    description: 'Track the contrast between official narratives and opposition coverage around power, civic space, and regional pressure.',
    href: '/nicaragua',
    externalUrl: 'https://layer3.news/posts/subjects/nicaragua',
    flag: '/flags/ni.png',
    lat: 12.865,
    lng: -85.207,
    match: feat => feat.properties.ISO_A2 === 'NI' || feat.properties.NAME === 'Nicaragua'
  },
  {
    title: 'Venezuela',
    subtitle: 'Government-aligned vs. Opposition',
    label: 'Venezuela: government-aligned vs. opposition media',
    description: 'See how government-aligned and opposition sources diverge on institutions, elections, sanctions, and daily life.',
    href: '/venezuela',
    externalUrl: 'https://layer3.news/posts/subjects/venezuela',
    flag: '/flags/ve.png',
    lat: 6.423,
    lng: -66.589,
    match: feat => feat.properties.ISO_A2 === 'VE' || feat.properties.NAME === 'Venezuela'
  },
  {
    title: 'Europe',
    subtitle: 'Elite vs. Populist',
    label: 'Europe: elite vs. populist media',
    description: 'Compare establishment and populist media frames across migration, institutions, security, and EU-level politics.',
    href: '/europe',
    externalUrl: 'https://layer3.news/posts/subjects/europe',
    flag: '/flags/eu.png',
    lat: 51.165,
    lng: 10.451,
    match: feat => feat.properties.CONTINENT === 'Europe' && feat.properties.NAME !== 'Russia'
  },
  {
    title: 'United States',
    subtitle: 'Left vs. Right',
    label: 'United States: left-aligned vs. right-aligned media',
    description: 'Contrast left-leaning and right-leaning narratives across elections, institutions, culture, and policy debates.',
    href: '/united-states',
    externalUrl: 'https://layer3.news/posts/subjects/u.s.',
    flag: '/flags/us.png',
    lat: 39.828,
    lng: -98.579,
    match: feat => feat.properties.ISO_A2 === 'US' || feat.properties.ISO_A3 === 'USA' || feat.properties.NAME === 'United States of America'
  }
];

const initGlobe = () => {
  const container = document.getElementById('globe-container');
  if (!container) return;

  const panel = document.getElementById('hub-panel');
  const panelFlag = document.getElementById('hub-panel-flag');
  const panelTitle = document.getElementById('hub-panel-title');
  const panelSubtitle = document.getElementById('hub-panel-subtitle');
  const panelDescription = document.getElementById('hub-panel-description');
  const panelCta = document.getElementById('hub-panel-cta');
  const panelClose = document.getElementById('hub-panel-close');

  let activeHub = null;
  const findHubByFeature = feat => hubs.find(hub => hub.match(feat));

  const globe = Globe()(container)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg') // Dark realistic night look
    .backgroundColor('rgba(0,0,0,0)')
    // Core points
    .pointsData(hubs)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor(() => '#0072FC')
    .pointAltitude(0.01)
    .pointRadius(1.05)
    .pointResolution(18)
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
    .labelSize(1.35)
    .labelDotRadius(0.3)
    .labelColor(() => 'rgba(255, 255, 255, 0.9)')
    .labelResolution(2)
    .labelAltitude(0.02)
    .onLabelClick(d => toggleHub(d))
    .onPointClick(d => toggleHub(d))
    .onGlobeClick(() => clearHub());

  // Load and configure polygons to clearly show landmasses and highlight countries
  fetch('https://unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
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
        .polygonsTransitionDuration(300)
        .onPolygonClick(feat => {
          const hub = findHubByFeature(feat);
          if (hub) {
            toggleHub(hub);
          }
        });
    });

  const updateSidebar = () => {
    document.querySelectorAll('.region-item').forEach(link => {
      if (activeHub && link.getAttribute('data-href') === activeHub.href) {
        link.classList.add('active');
        link.setAttribute('aria-pressed', 'true');
      } else {
        link.classList.remove('active');
        link.setAttribute('aria-pressed', 'false');
      }
    });
  };

  const updatePanel = () => {
    if (!panel) return;

    if (!activeHub) {
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
      return;
    }

    panelFlag.src = activeHub.flag;
    panelFlag.alt = `${activeHub.title} flag`;
    panelTitle.textContent = activeHub.title;
    panelSubtitle.textContent = activeHub.subtitle;
    panelDescription.textContent = activeHub.description;
    panelCta.href = activeHub.externalUrl;
    panel.style.setProperty('--hub-art', activeHub.heroImage ? `url("${activeHub.heroImage}")` : 'none');
    panel.classList.toggle('has-hero-art', Boolean(activeHub.heroImage));
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
  };

  const initialPosition = { lat: 18, lng: -45, altitude: 1.85 };

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
    updatePanel();
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
    updatePanel();
  };

  // Bind sidebar links to toggle the country on click
  document.querySelectorAll('.region-item').forEach(link => {
    link.setAttribute('aria-pressed', 'false');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('data-href');
      const hub = hubs.find(h => h.href === href);
      if (hub) {
        toggleHub(hub);
      }
    });
  });

  if (panelClose) {
    panelClose.addEventListener('click', clearHub);
  }

  // Custom atmosphere
  globe.atmosphereColor('#0072FC').atmosphereAltitude(0.15);

  // Auto-rotate
  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.5;
  globe.controls().enableZoom = false; // Disable zoom

  // Set initial position
  globe.pointOfView(initialPosition);
  updatePanel();

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
