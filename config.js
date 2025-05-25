const GOOGLE_MAPS_API_KEY = 'AIzaSyDCYRs3mxvoT2YsJE6wFVHfWEQYDQTVwSQ';
const SEARCH_CONSOLE_SITE = 'https://m-clean.net';
const SEARCH_CONSOLE_API_KEY = 'YOUR_SEARCH_CONSOLE_API_KEY'; // (اختياري لو تحتاج OAuth فقط)

// Google OAuth Login
function authenticateWithGoogle(callback) {
  const clientId = '591960142463-5r7ict52i6tt63jjg5e2ior9soe9r1j0.apps.googleusercontent.com';
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
  const redirectUri = 'https://MrCleanCare.github.io/gmb-verifier/';

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=token&scope=${encodeURIComponent(scope)}`;

  window.location.href = authUrl;
}

function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
  }
  return null;
}

// dummy stubs (replace with real logic if needed)
function checkSiteInSearchConsoleOAuth(token, siteUrl, messages, passed, callback) {
  // fake successful result for demo
  setTimeout(() => {
    messages.push("✅ الموقع مؤكد من Google Search Console");
    callback(messages, passed);
  }, 1000);
}

function verifyBusinessPlace(name, lat, lng, messages, passed, callback) {
  // fake successful result for demo
  setTimeout(() => {
    messages.push("✅ النشاط موجود على Google Maps");
    callback(messages, passed);
  }, 1000);
}
