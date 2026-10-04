// Google Places API wrapper. Tries the Places API (New) first, falls back to the
// legacy Places API, and normalises both into a single place shape.
window.PlacesAPI = (function () {
  const BASE = CONFIG.PLACES_BASE;
  const LEGACY = CONFIG.LEGACY_BASE;
  const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location,places.primaryType,places.types,places.photos,places.editorialSummary,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri';

  function priceLevelToInt(s) {
    if (typeof s === 'number') return s;
    if (!s) return null;
    const map = { FREE: 0, INEXPENSIVE: 1, MODERATE: 2, EXPENSIVE: 3, VERY_EXPENSIVE: 4 };
    for (const k in map) if (s.indexOf(k) >= 0) return map[k];
    return null;
  }

  function normalizeNew(p) {
    const photo = (p.photos && p.photos[0] && p.photos[0].name)
      ? BASE + '/' + p.photos[0].name + '/media?maxWidthPx=' + CONFIG.PHOTO_MAX_WIDTH + '&key=' + CONFIG.API_KEY
      : null;
    return {
      id: p.id || null,
      name: (p.displayName && p.displayName.text) || '',
      rating: p.rating || null,
      userRatingCount: p.userRatingCount || null,
      priceLevel: priceLevelToInt(p.priceLevel),
      lat: p.location ? p.location.latitude : null,
      lng: p.location ? p.location.longitude : null,
      photoUrl: photo,
      address: p.formattedAddress || p.shortFormattedAddress || '',
      openNow: p.regularOpeningHours ? p.regularOpeningHours.openNow : null,
      phone: p.nationalPhoneNumber || null,
      website: p.websiteUri || null,
      mapsUri: p.googleMapsUri || null,
      summary: (p.editorialSummary && p.editorialSummary.text) || '',
    };
  }

  function normalizeLegacy(p) {
    const loc = p.geometry && p.geometry.location;
    const photo = (p.photos && p.photos[0] && p.photos[0].photo_reference)
      ? LEGACY + '/photo?maxwidth=' + CONFIG.PHOTO_MAX_WIDTH + '&photo_reference=' + encodeURIComponent(p.photos[0].photo_reference) + '&key=' + CONFIG.API_KEY
      : null;
    return {
      id: p.place_id || null,
      name: p.name || '',
      rating: p.rating || null,
      userRatingCount: p.user_ratings_total || null,
      priceLevel: (p.price_level != null) ? p.price_level : null,
      lat: loc ? loc.lat : null,
      lng: loc ? loc.lng : null,
      photoUrl: photo,
      address: p.vicinity || '',
      openNow: p.opening_hours ? p.opening_hours.open_now : null,
      phone: null,
      website: null,
      mapsUri: null,
      summary: '',
    };
  }

  async function readError(res) {
    try {
      const data = await res.json();
      if (data && data.error && data.error.message) return data.error.status + ': ' + data.error.message;
      return String(res.status);
    } catch (e) { return String(res.status); }
  }

  async function searchNearbyNew(params) {
    const res = await fetch(BASE + '/places:searchNearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': CONFIG.API_KEY, 'X-Goog-FieldMask': FIELD_MASK },
      body: JSON.stringify({
        includedTypes: params.includedTypes,
        maxResultCount: 20,
        locationRestriction: { circle: { center: { latitude: params.lat, longitude: params.lng }, radius: params.radius } },
      }),
    });
    if (!res.ok) throw new Error('Places API ' + await readError(res));
    const data = await res.json();
    return (data.places || []).map(normalizeNew);
  }

  async function searchTextNew(params) {
    const res = await fetch(BASE + '/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': CONFIG.API_KEY, 'X-Goog-FieldMask': FIELD_MASK },
      body: JSON.stringify({
        textQuery: params.keyword,
        maxResultCount: 20,
        locationBias: { circle: { center: { latitude: params.lat, longitude: params.lng }, radius: params.radius } },
      }),
    });
    if (!res.ok) throw new Error('Places API ' + await readError(res));
    const data = await res.json();
    return (data.places || []).map(normalizeNew);
  }

  async function searchLegacy(params) {
    const url = LEGACY + '/textsearch/json?query=' + encodeURIComponent(params.keyword) +
      '&location=' + params.lat + ',' + params.lng + '&radius=' + params.radius +
      '&type=restaurant&key=' + CONFIG.API_KEY;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Places API ' + res.status);
    const data = await res.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error('Places API status: ' + data.status + (data.error_message ? ' — ' + data.error_message : ''));
    }
    return (data.results || []).map(normalizeLegacy);
  }

  async function searchRestaurants(params) {
    if (!CONFIG.API_KEY) throw new Error('未設定 Google Places API 金鑰 — 按右上角 🔑 設定。No Google Places API key set.');
    params.radius = params.radius || CONFIG.DEFAULT_RADIUS;
    if (params.keyword == null) params.keyword = '';
    try {
      if (params.includedTypes && params.includedTypes.length) return await searchNearbyNew(params);
      return await searchTextNew(params);
    } catch (e) {
      console.warn('Places API (New) failed, falling back to legacy.', e);
      return await searchLegacy(params);
    }
  }

  // Sort by rating then review count, preferring places at/above MIN_RATING.
  function rankPlaces(places) {
    const scored = places.map(function (p) {
      const rating = p.rating || 0;
      const count = p.userRatingCount || 0;
      return { p: p, score: rating * 10 + Math.min(count, 200) / 200 };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    let filtered = scored.filter(function (s) { return (s.p.rating || 0) >= CONFIG.MIN_RATING; }).map(function (s) { return s.p; });
    if (!filtered.length) filtered = scored.map(function (s) { return s.p; });
    return filtered;
  }

  return { searchRestaurants: searchRestaurants, rankPlaces: rankPlaces };
})();
