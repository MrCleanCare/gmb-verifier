
const GOOGLE_MAPS_API_KEY = 'AIzaSyDCYRs3mxvoT2YsJE6wFVHfWEQYDQTVwSQ';
const SEARCH_CONSOLE_SITE = 'https://m-clean.net';
const PLACE_API_URL = 'https://places.googleapis.com/v1/places:searchText';

function authenticateWithGoogle() {
  const clientId = '591960142463-5r7ict52i6tt63jjg5e2ior9soe9r1j0.apps.googleusercontent.com';
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
  const redirectUri = 'https://MrCleanCare.github.io/gmb-verifier/';
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(scope)}`;
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
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      if (data.siteUrl) {
        messages.push("✅ تم التحقق من ملكية الموقع في Google Search Console");
      } else {
        messages.push("❌ الموقع غير مرتبط بحساب Search Console");
        passed = false;
      }
      callback(messages, passed);
    })
    .catch(() => {
      messages.push("⚠️ لم نتمكن من الوصول إلى Google Search Console API");
      passed = false;
      callback(messages, passed);
    });
}

function verifyBusinessPlace(name, lat, lng, messages, passed, callback) {
  const body = {
    textQuery: name,
    locationBias: {
      circle: { center: { latitude: lat, longitude: lng }, radius: 300 }
    }
  };
  fetch(`${PLACE_API_URL}?key=${GOOGLE_MAPS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(data => {
      if (data.places && data.places.length > 0) {
        messages.push("✅ النشاط موجود فعليًا في Google Places ضمن النطاق الجغرافي");
      } else {
        messages.push("❌ لم يتم العثور على النشاط في Google Maps، تأكد من الاسم والموقع");
        passed = false;
      }
      callback(messages, passed);
    })
    .catch(() => {
      messages.push("⚠️ فشل الاتصال بـ Google Places API");
      passed = false;
      callback(messages, passed);
    });
}

function checkEmailDomainMatch(email, website, messages) {
  const emailDomain = email.split('@')[1];
  const websiteDomain = new URL(website).hostname.replace('www.', '');
  if (websiteDomain.includes(emailDomain)) {
    messages.push("✅ البريد الإلكتروني يتطابق مع نطاق الموقع");
  } else {
    messages.push("❌ البريد الإلكتروني لا يتطابق مع نطاق الموقع");
  }
}

function checkArabicBusinessName(name, messages) {
  const arabicRegex = /[\u0600-\u06FF]/;
  if (arabicRegex.test(name)) {
    messages.push("✅ اسم النشاط يحتوي على حروف عربية واضحة");
  } else {
    messages.push("❌ اسم النشاط لا يبدو عربياً");
  }
}

function checkSaudiCityInAddress(address, messages) {
  const cities = ["جدة", "الرياض", "مكة", "الدمام", "المدينة", "الطائف"];
  const found = cities.find(city => address.includes(city));
  if (found) {
    messages.push(`✅ تم تحديد المدينة السعودية: ${found}`);
  } else {
    messages.push("❌ لم يتم تحديد مدينة سعودية في العنوان");
  }
}

function validateProfile() {
  const name = document.getElementById("businessName").value;
  const address = document.getElementById("address").value;
  const coordinates = document.getElementById("coordinates").value;
  const website = document.getElementById("website").value;
  const email = document.getElementById("email").value;

  const latLng = coordinates.split(',');
  const lat = parseFloat(latLng[0]);
  const lng = parseFloat(latLng[1]);

  let messages = [];
  let passed = true;

  checkEmailDomainMatch(email, website, messages);
  checkArabicBusinessName(name, messages);
  checkSaudiCityInAddress(address, messages);

  const token = getAccessTokenFromUrl();
  if (token) {
    checkSiteInSearchConsoleOAuth(token, SEARCH_CONSOLE_SITE, messages, passed, (msgs1, status1) => {
      verifyBusinessPlace(name, lat, lng, msgs1, status1, (msgs2, status2) => {
        const resultBox = document.getElementById("resultBox");
        resultBox.className = 'result ' + (status2 ? 'success' : 'error');
        resultBox.innerHTML = "<ul>" + msgs2.map(msg => "<li>" + msg + "</li>").join('') + "</ul>";
      });
    });
  } else {
    messages.push("🔐 لم يتم تسجيل الدخول بعد. اضغط لتسجيل الدخول.");
    const resultBox = document.getElementById("resultBox");
    resultBox.innerHTML = "";
    const btn = document.createElement("button");
    btn.innerText = "تسجيل الدخول إلى Google";
    btn.onclick = () => authenticateWithGoogle();
    resultBox.appendChild(btn);
  }
}

window.onload = function () {
  if (window.location.hash.includes("access_token")) {
    setTimeout(validateProfile, 500);
  }
};
