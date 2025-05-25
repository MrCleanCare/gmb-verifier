// ملف config.js (يُحفظ بجانب الصفحة)
const GOOGLE_MAPS_API_KEY = 'AIzaSyDCYRs3mxvoT2YsJE6wFVHfWEQYDQTVwSQ';
const SEARCH_CONSOLE_SITE = 'https://m-clean.net';
const SEARCH_CONSOLE_API_KEY = 'YOUR_SEARCH_CONSOLE_API_KEY';
const PLACE_API_URL = 'https://places.googleapis.com/v1/places:searchText';

// OAuth إعداد الاتصال باستخدام
function authenticateWithGoogle(callback) {
  const clientId = '591960142463-5r7ict52i6tt63jjg5e2ior9soe9r1j0.apps.googleusercontent.com';
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
  const redirectUri = window.location.origin;
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

function checkSiteInSearchConsoleOAuth(token, siteUrl, messages, passed, callback) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`;
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.siteUrl) {
        messages.push("✅ الموقع مرتبط بحساب Google Search Console عبر OAuth");
      } else {
        messages.push("❌ لم يتم العثور على الموقع في حساب Search Console (OAuth)");
        passed = false;
      }
      callback(messages, passed);
    })
    .catch(() => {
      messages.push("⚠️ فشل الاتصال بـ Google Search Console عبر OAuth");
      passed = false;
      callback(messages, passed);
    });
}

function verifyBusinessPlace(name, lat, lng, messages, passed, callback) {
  const body = {
    textQuery: name,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 300
      }
    }
  };
  fetch(PLACE_API_URL + `?key=${GOOGLE_MAPS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(data => {
      if (data.places && data.places.length > 0) {
        messages.push("✅ تم العثور على اسم النشاط في Google Places");
      } else {
        messages.push("⚠️ لم يتم العثور على النشاط، تأكد من شهرة الاسم");
        passed = false;
      }
      callback(messages, passed);
    })
    .catch(() => {
      messages.push("⚠️ تعذر الاتصال بـ Places API للتحقق من الاسم");
      passed = false;
      callback(messages, passed);
    });
}

const token = getAccessTokenFromUrl();
if (token) {
  checkSiteInSearchConsoleOAuth(token, SEARCH_CONSOLE_SITE, messages, passed, (msgs1, status1) => {
    const latLng = coordinates.split(',');
    const lat = parseFloat(latLng[0]);
    const lng = parseFloat(latLng[1]);
    verifyBusinessPlace(name, lat, lng, msgs1, status1, (msgs2, status2) => {
      const resultBox = document.getElementById("resultBox");
      resultBox.className = 'result ' + (status2 ? 'success' : 'error');
      resultBox.innerHTML = `<ul>${msgs2.map(msg => `<li>${msg}</li>`).join('')}</ul>`;
    });
  });
} else {
  messages.push("ℹ️ لم يتم التفويض مع حساب Google بعد. اضغط لتسجيل الدخول.");
  const loginBtn = document.createElement("button");
  loginBtn.innerText = "تسجيل الدخول إلى Google";
  loginBtn.onclick = () => authenticateWithGoogle();
  document.getElementById("resultBox").appendChild(loginBtn);
}
