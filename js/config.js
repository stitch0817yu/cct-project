// Central configuration — defaults live here.
// API keys are NOT stored here. They are entered by the user in the browser
// (see js/keys.js) and kept in localStorage; js/keys.js writes them into
// CONFIG.API_KEY / CONFIG.DEEPSEEK_API_KEY at runtime.
window.CONFIG = {
  API_KEY: '',
  PLACES_BASE: 'https://places.googleapis.com/v1',
  LEGACY_BASE: 'https://maps.googleapis.com/maps/api/place',
  DEFAULT_LOCATION: { lat: 22.312543180089005, lng: 114.16526445937212, label: '香港 Hong Kong' },
  DEFAULT_RADIUS: 3000,
  MIN_RATING: 4.0,
  PHOTO_MAX_WIDTH: 400,
  DEEPSEEK_API_KEY: '',
  DEEPSEEK_BASE: 'https://api.deepseek.com',
  DEEPSEEK_MODEL: 'deepseek-flash',
};

// Google Maps turn-by-turn navigation deep link (opens the app on mobile).
window.navUrl = function (place) {
  let url = 'https://www.google.com/maps/dir/?api=1&destination=' + place.lat + ',' + place.lng;
  if (place.id) url += '&destination_place_id=' + encodeURIComponent(place.id);
  return url;
};

// Google Maps search deep link for a cuisine near the user.
window.cuisineSearchUrl = function (query, loc) {
  let url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  if (loc && loc.lat != null) url += '&center=' + loc.lat + ',' + loc.lng;
  return url;
};
