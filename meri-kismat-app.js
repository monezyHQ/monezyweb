"use strict";
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, "0");
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const sin = (d) => Math.sin(d * D2R), cos = (d) => Math.cos(d * D2R), tan = (d) => Math.tan(d * D2R);
const norm = (x) => ((x % 360) + 360) % 360;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STORAGE = "merikismat-v2";
const PLACES = window.MK_PLACES || [];
const SEARCH = PLACES.map((p) => (p.n + " " + p.sub + " " + p.alt).toLowerCase());

/* ---------- starfield ---------- */
(function () {
  const c = $("#stars"); if (!c) return;
  const x = c.getContext("2d");
  let w, h, st = [];
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    const n = Math.min(140, Math.round(innerWidth * innerHeight / 12000));
    st = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.4 + 0.35) * dpr,
      a: Math.random() * 0.6 + 0.22, vx: (Math.random() - 0.5) * 0.05 * dpr, vy: (Math.random() - 0.5) * 0.05 * dpr, t: Math.random() * 6.3
    }));
  }
  function frame() {
    x.clearRect(0, 0, w, h);
    const dpr = Math.min(devicePixelRatio || 1, 2), link = 100 * dpr;
    x.lineWidth = dpr * 0.5;
    for (let i = 0; i < st.length; i++) {
      const a = st[i];
      if (!RM) {
        a.x += a.vx; a.y += a.vy; a.t += 0.012;
        if (a.x < 0) a.x = w; if (a.x > w) a.x = 0; if (a.y < 0) a.y = h; if (a.y > h) a.y = 0;
      }
      for (let j = i + 1; j < st.length; j++) {
        const b = st[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          x.strokeStyle = "rgba(170,158,255," + (0.09 * (1 - d / link)) + ")";
          x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
        }
      }
      x.fillStyle = "rgba(238,235,255," + (RM ? a.a : a.a * (0.7 + 0.3 * Math.sin(a.t))) + ")";
      x.beginPath(); x.arc(a.x, a.y, a.r, 0, 7); x.fill();
    }
    requestAnimationFrame(frame);
  }
  build(); frame(); addEventListener("resize", build);
})();

(function () {
  const gl = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  let s = "";
  gl.forEach((g, i) => {
    const a = (i * 30 - 75) * D2R, a2 = (i * 30 - 90) * D2R;
    s += `<text x="${250 + 174 * Math.cos(a)}" y="${250 + 174 * Math.sin(a) + 7}" text-anchor="middle" font-size="19" fill="rgba(242,239,255,.6)">${g}</text>`;
    s += `<line x1="${250 + 152 * Math.cos(a2)}" y1="${250 + 152 * Math.sin(a2)}" x2="${250 + 196 * Math.cos(a2)}" y2="${250 + 196 * Math.sin(a2)}" stroke="rgba(255,255,255,.12)"/>`;
  });
  const zr = $("#zring"); if (zr) zr.innerHTML = s;
  const pr = $("#pring");
  if (pr) pr.innerHTML = [["☉", 22], ["☾", 96], ["♂", 140], ["☿", 188], ["♃", 252], ["♀", 300], ["♄", 334]].map(([g, d]) => {
    const a = (d - 90) * D2R, px = 250 + 124 * Math.cos(a), py = 250 + 124 * Math.sin(a);
    return `<circle cx="${px}" cy="${py}" r="13" fill="rgba(95,220,255,.1)" stroke="rgba(95,220,255,.45)"/>
     <text x="${px}" y="${py + 5}" text-anchor="middle" font-size="14" fill="#F2EFFF">${g}</text>`;
  }).join("");
})();

const GITA = [
  { r: "2.47", t: "karma", sk: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br>मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥", tr: "karmaṇy-evādhikāras te mā phaleṣu kadācana", hi: "तेरा अधिकार केवल कर्म करने में है, उसके फल में कभी नहीं।", en: "Your claim is on the work itself, never on its fruit. Do not act only for the result — and do not let that become an excuse to stop acting." },
  { r: "2.48", t: "equanimity", sk: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।<br>सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥", tr: "yogasthaḥ kuru karmāṇi saṅgaṃ tyaktvā dhanañjaya", hi: "आसक्ति छोड़कर, सफलता और असफलता दोनों में समान रहकर कर्म कर।", en: "Do your work with attachment set down, steady whether it succeeds or fails. That evenness is what yoga means." },
  { r: "2.14", t: "endurance", sk: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।<br>आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥", tr: "mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ", hi: "सर्दी-गर्मी और सुख-दुःख आते हैं और चले जाते हैं। इन्हें सहन करना सीख।", en: "Cold and heat, pleasure and pain, arrive and leave. Learn to sit through them." },
  { r: "2.20", t: "the self", sk: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः।<br>अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥", tr: "na jāyate mriyate vā kadācin", hi: "यह आत्मा न जन्म लेती है, न मरती है। शरीर के नष्ट होने पर भी यह नष्ट नहीं होती।", en: "This self is not born and does not die. It does not perish when the body does." },
  { r: "6.5", t: "self-reliance", sk: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।<br>आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥", tr: "uddhared ātmanātmānaṃ nātmānam avasādayet", hi: "मनुष्य स्वयं ही अपना उद्धार करे। मनुष्य स्वयं ही अपना मित्र है और स्वयं ही अपना शत्रु।", en: "Lift yourself by yourself. You are your own ally, and you are your own enemy." },
  { r: "3.35", t: "your own path", sk: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।<br>स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥", tr: "śreyān sva-dharmo viguṇaḥ para-dharmāt sv-anuṣṭhitāt", hi: "अपना धर्म अधूरा निभाना भी दूसरे के पूरे धर्म से श्रेष्ठ है।", en: "Your own work done imperfectly is better than someone else’s done well." },
  { r: "4.38", t: "knowledge", sk: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।<br>तत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति॥", tr: "na hi jñānena sadṛśaṃ pavitram iha vidyate", hi: "ज्ञान के समान पवित्र करने वाला और कुछ नहीं है।", en: "Nothing in this world cleanses like knowledge. The one ripened by practice finds it within." },
  { r: "6.35", t: "the restless mind", sk: "असंशयं महाबाहो मनो दुर्निग्रहं चलम्।<br>अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥", tr: "asaṃśayaṃ mahā-bāho mano durnigrahaṃ calam", hi: "मन चंचल है। फिर भी अभ्यास और वैराग्य से वह वश में आता है।", en: "The mind is restless and hard to hold. Even so, it is steadied by practice and by loosening the grip on outcomes." },
  { r: "12.15", t: "how to be with people", sk: "यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः।<br>हर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः॥", tr: "yasmān nodvijate loko lokān nodvijate ca yaḥ", hi: "जिससे संसार को कष्ट नहीं होता और जिसे संसार से कष्ट नहीं होता — वह प्रिय है।", en: "The one the world is not troubled by, and who is not troubled by the world — that one is dear." },
  { r: "16.24", t: "why sources matter", sk: "तस्माच्छास्त्रं प्रमाणं ते कार्याकार्यव्यवस्थितौ।<br>ज्ञात्वा शास्त्रविधानोक्तं कर्म कर्तुमिहार्हसि॥", tr: "tasmāc chāstraṃ pramāṇaṃ te kāryākārya-vyavasthitau", hi: "क्या करना चाहिए, इसका निर्णय शास्त्र से कर।", en: "Let the texts be your measure when deciding what should and should not be done. Know what they actually say." }
];
let gyanI = -1;
function showGyan(i) {
  gyanI = i; const g = GITA[i];
  $("#gyanRef").textContent = "Bhagavad Gita " + g.r + " · " + g.t;
  $("#gyanBody").innerHTML = `<p class="sk" lang="sa">${g.sk}</p><p class="tr">${g.tr}</p>
    <div class="gyan-tx"><div class="hi"><span class="lbl">हिन्दी</span><p lang="hi">${g.hi}</p></div>
    <div><span class="lbl">English</span><p>${g.en}</p></div></div>`;
  $("#gyanNote").textContent = "Sanskrit as in the received public-domain text. Hindi and English are our own plain renderings — verse " + (i + 1) + " of " + GITA.length + ".";
}
showGyan(Math.floor(Math.random() * GITA.length));
$("#gyanNext").onclick = () => { let n; do { n = Math.floor(Math.random() * GITA.length); } while (n === gyanI && GITA.length > 1); showGyan(n); };

addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 18), { passive: true });
const sheet = $("#sheet"), burger = $("#burger");
const tg = (o) => { sheet.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
burger.onclick = () => tg(true); $("#closeSheet").onclick = () => tg(false);
sheet.querySelectorAll("a").forEach((a) => a.onclick = () => tg(false));
addEventListener("keydown", (e) => { if (e.key === "Escape") tg(false); });

const tabs = [...document.querySelectorAll(".tab")];
function showTab(id, push) {
  const t = tabs.find((x) => x.getAttribute("aria-controls") === id) || tabs[0];
  tabs.forEach((o) => o.setAttribute("aria-selected", "false"));
  document.querySelectorAll(".pane").forEach((p) => p.classList.remove("on"));
  t.setAttribute("aria-selected", "true");
  $("#" + t.getAttribute("aria-controls")).classList.add("on");
  if (push !== false) {
    const h = t.dataset.hash || "chart";
    const url = new URL(location.href);
    url.hash = h;
    history.replaceState(null, "", url);
  }
  if (matchMedia("(max-width:1023px)").matches) {
    const p = $("#" + t.getAttribute("aria-controls"));
    if (p) setTimeout(() => p.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" }), 40);
  }
}
tabs.forEach((t) => t.onclick = () => showTab(t.getAttribute("aria-controls")));

function toast(m) {
  const el = $("#toast"); el.textContent = m; el.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("on"), 2200);
}

/* ================= ASTRONOMY ================= */
function jdFromYMD(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
const jdToMs = (jd) => (jd - 2440587.5) * 86400000;
function hhmm(jd, tz) {
  const d = new Date(jdToMs(jd) + tz * 3600000);
  return pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes());
}
function deltaT(y) {
  let t;
  if (y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
  if (y < 1941) { t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3; }
  if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
  if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
  if (y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t;
}
function sunLongitude(jd) {
  const n = jd - 2451545;
  return norm(norm(280.460 + 0.9856474 * n) + 1.915 * sin(norm(357.528 + 0.9856003 * n)) + 0.020 * sin(2 * norm(357.528 + 0.9856003 * n)));
}
const TL = [[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],
[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],
[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],
[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
function moonLongitude(jd) {
  const T = (jd - 2451545) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
  const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T, E = 1 - 0.002516 * T - 0.0000074 * T * T;
  let s = 0;
  for (const [d, m, mp, f, c] of TL) {
    let e = 1; if (Math.abs(m) === 1) e = E; else if (Math.abs(m) === 2) e = E * E;
    s += c * e * sin(d * D + m * M + mp * Mp + f * F);
  }
  s += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
  return norm(Lp + s / 1000000);
}
const gmst = (jd) => {
  const T = (jd - 2451545) / 36525;
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T ** 3 / 38710000);
};
const obliquity = (jd) => {
  const T = (jd - 2451545) / 36525;
  return 23.439291111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T ** 3;
};
function ascendant(jd, lat, lng) {
  const ramc = norm(gmst(jd) + lng), e = obliquity(jd);
  return norm(Math.atan2(cos(ramc), -(sin(ramc) * cos(e) + tan(lat) * sin(e))) * R2D);
}
const ayanamsa = (jd) => 23.85333 + ((jd - 2451545) / 365.25) * (50.29 / 3600);
function sunTimes(y, mo, da, lat, lng) {
  const dd = jdFromYMD(y, mo, da) - 2451545, n = Math.round(dd + 0.5), Js = n + 0.0009 - lng / 360;
  const M = norm(357.5291 + 0.98560028 * Js);
  const C = 1.9148 * sin(M) + 0.0200 * sin(2 * M) + 0.0003 * sin(3 * M), lam = norm(M + C + 180 + 102.9372);
  const Jt = 2451545 + Js + 0.0053 * sin(M) - 0.0069 * sin(2 * lam);
  const dec = Math.asin(sin(lam) * sin(23.4397)) * R2D;
  const cw = (sin(-0.833) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
  if (cw > 1) return { polar: "The Sun does not rise here on this date." };
  if (cw < -1) return { polar: "The Sun does not set here on this date." };
  const w = Math.acos(cw) * R2D;
  return { rise: Jt - w / 360, set: Jt + w / 360 };
}
function tzOffsetAt(zone, date) {
  try {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(date).reduce((a, x) => (a[x.type] = x.value, a), {});
    return (Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second) - date.getTime()) / 3600000;
  } catch (e) { return null; }
}
function wallToUTCms(zone, y, mo, d, h, mi) {
  let g = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 2; i++) {
    const off = tzOffsetAt(zone, new Date(g));
    if (off === null) return g;
    g = Date.UTC(y, mo - 1, d, h, mi) - off * 3600000;
  }
  return g;
}
function fmtOff(o) {
  const s = o < 0 ? "−" : "+", a = Math.abs(o), h = Math.floor(a + 1e-9), m = Math.round((a - h) * 60);
  return "UTC" + s + h + ":" + pad2(m === 60 ? 0 : m);
}
function validYMD(y, m, d) {
  if (!y || !m || !d) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

const SIGNS = [["Mesha","Aries","♈"],["Vrishabha","Taurus","♉"],["Mithuna","Gemini","♊"],["Karka","Cancer","♋"],
 ["Simha","Leo","♌"],["Kanya","Virgo","♍"],["Tula","Libra","♎"],["Vrischika","Scorpio","♏"],
 ["Dhanu","Sagittarius","♐"],["Makara","Capricorn","♑"],["Kumbha","Aquarius","♒"],["Meena","Pisces","♓"]];
const SIGNLORD = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
const dms = (g) => { const d = Math.floor(g), m = Math.round((g - d) * 60); return (m === 60 ? d + 1 : d) + "°" + pad2(m === 60 ? 0 : m) + "′"; };
const LORDS = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
const YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
const NAK = [["Ashwini","अश्विनी","Ashwini Kumaras","Deva"],["Bharani","भरणी","Yama","Manushya"],["Krittika","कृत्तिका","Agni","Rakshasa"],
["Rohini","रोहिणी","Brahma","Manushya"],["Mrigashira","मृगशिरा","Soma","Deva"],["Ardra","आर्द्रा","Rudra","Manushya"],
["Punarvasu","पुनर्वसु","Aditi","Deva"],["Pushya","पुष्य","Brihaspati","Deva"],["Ashlesha","आश्लेषा","Nagas","Rakshasa"],
["Magha","मघा","Pitris","Rakshasa"],["Purva Phalguni","पूर्व फाल्गुनी","Bhaga","Manushya"],["Uttara Phalguni","उत्तर फाल्गुनी","Aryaman","Manushya"],
["Hasta","हस्त","Savitr","Deva"],["Chitra","चित्रा","Tvashtar","Rakshasa"],["Swati","स्वाति","Vayu","Deva"],
["Vishakha","विशाखा","Indra-Agni","Rakshasa"],["Anuradha","अनुराधा","Mitra","Deva"],["Jyeshtha","ज्येष्ठा","Indra","Rakshasa"],
["Mula","मूल","Nirriti","Rakshasa"],["Purva Ashadha","पूर्वाषाढ़ा","Apas","Manushya"],["Uttara Ashadha","उत्तराषाढ़ा","Vishvedevas","Manushya"],
["Shravana","श्रवण","Vishnu","Deva"],["Dhanishta","धनिष्ठा","Vasus","Rakshasa"],["Shatabhisha","शतभिषा","Varuna","Rakshasa"],
["Purva Bhadrapada","पूर्व भाद्रपदा","Aja Ekapada","Manushya"],["Uttara Bhadrapada","उत्तर भाद्रपदा","Ahir Budhnya","Manushya"],
["Revati","रेवती","Pushan","Deva"]].map((n, i) => ({ i, name: n[0], deva: n[1], deity: n[2], gana: n[3], lord: LORDS[i % 9], start: i * (40 / 3) }));
const NAKW = 40 / 3;
function spanText(k) {
  const f = (x) => { const si = Math.floor(x / 30) % 12; return dms(x - Math.floor(x / 30) * 30) + " " + SIGNS[si][0]; };
  return f(k.start) + " – " + f(k.start + NAKW - 0.0001);
}
const HOUSEMEAN = ["self, body, temperament","wealth, family, speech","courage, siblings, effort","home, mother, inner ground",
 "intellect, children, creativity","debt, illness, service","partnership, the other","upheaval, inheritance, the hidden",
 "fortune, father, belief","work, status, action","gains, networks, elders","loss, seclusion, release"];

function findPlaces(q, max) {
  q = q.trim().toLowerCase(); if (q.length < 2) return [];
  const pre = [], mid = [];
  for (let i = 0; i < PLACES.length; i++) {
    const h = SEARCH[i]; const at = h.indexOf(q);
    if (at < 0) continue;
    if (at === 0 || h[at - 1] === " ") pre.push(i); else mid.push(i);
    if (pre.length >= max) break;
  }
  return pre.concat(mid).slice(0, max).map((i) => PLACES[i]);
}
const CHOSEN = { b: null, d: null };
function combo(key, inputSel, listSel, onPick) {
  const inp = $(inputSel), list = $(listSel); let items = [], cur = -1;
  const close = () => { list.classList.remove("on"); inp.setAttribute("aria-expanded", "false"); cur = -1; };
  const paint = () => {
    if (!items.length) list.innerHTML = '<li class="none">No match. Try fewer letters, or open “coordinates”.</li>';
    else list.innerHTML = items.map((p, i) => `<li role="option" data-i="${i}" aria-selected="${i === cur}">${esc(p.n)}<small>${esc(p.sub || " ")}</small></li>`).join("");
    list.classList.add("on"); inp.setAttribute("aria-expanded", "true");
  };
  const pick = (i) => { const p = items[i]; if (!p) return; CHOSEN[key] = p; inp.value = p.label; close(); onPick && onPick(p); };
  inp.addEventListener("input", () => {
    CHOSEN[key] = null; items = findPlaces(inp.value, 40);
    if (inp.value.trim().length < 2) { close(); return; } paint();
  });
  inp.addEventListener("focus", () => { if (items.length) paint(); });
  inp.addEventListener("keydown", (e) => {
    if (!list.classList.contains("on")) return;
    if (e.key === "ArrowDown") { e.preventDefault(); cur = Math.min(cur + 1, items.length - 1); paint(); list.children[cur] && list.children[cur].scrollIntoView({ block: "nearest" }); }
    else if (e.key === "ArrowUp") { e.preventDefault(); cur = Math.max(cur - 1, 0); paint(); list.children[cur] && list.children[cur].scrollIntoView({ block: "nearest" }); }
    else if (e.key === "Enter") { e.preventDefault(); pick(cur < 0 ? 0 : cur); }
    else if (e.key === "Escape") close();
  });
  list.addEventListener("mousedown", (e) => { const li = e.target.closest("li[data-i]"); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
  document.addEventListener("click", (e) => { if (!inp.parentElement.contains(e.target)) close(); });
}
combo("b", "#bCity", "#bCityList", () => showTz());
combo("d", "#dCity", "#dCityList", () => { calcDay(); if (CH) renderDaily(); });

function customPlace() {
  const la = parseFloat($("#bLat").value), lo = parseFloat($("#bLng").value), z = ($("#bZone").value || "Asia/Kolkata").trim();
  if (!Number.isFinite(la) || !Number.isFinite(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) return null;
  if (!tzOffsetAt(z, new Date())) return null;
  return { name: `Custom ${la.toFixed(3)}, ${lo.toFixed(3)}`, lat: la, lng: lo, zone: z };
}
function place(key) {
  if (key === "b") {
    const c = customPlace();
    if (c) return c;
  }
  const p = CHOSEN[key];
  if (p) return { name: p.label, lat: p.la, lng: p.lo, zone: p.z };
  return null;
}
function showTz() {
  const p = place("b"), d = $("#bDate").value, t = $("#bTime").value || "12:00", el = $("#tzline");
  if (!p) { el.className = "tzline warn"; el.textContent = "Pick a place from the list, or enter latitude, longitude and timezone."; return; }
  if (!d) { el.textContent = ""; return; }
  const [Y, M, D] = d.split("-").map(Number), [hh, mi] = t.split(":").map(Number);
  if (!validYMD(Y, M, D)) { el.className = "tzline warn"; el.textContent = "That date is not a real calendar day."; return; }
  const ms = wallToUTCms(p.zone, Y, M, D, hh, mi), off = tzOffsetAt(p.zone, new Date(ms));
  el.className = "tzline";
  el.textContent = `✓ ${p.name} · ${p.zone} on that date = ${fmtOff(off)} — historical DST applied if the zone has it.`;
}
["#bDate", "#bTime", "#bLat", "#bLng", "#bZone"].forEach((s) => $(s).addEventListener("input", showTz));
$("#bNoTime").addEventListener("change", (e) => { $("#bTime").disabled = e.target.checked; if (e.target.checked) $("#bTime").value = "12:00"; showTz(); });

let myNak = null;
function renderNak(q = "") {
  q = q.trim().toLowerCase();
  $("#nakBody").innerHTML = NAK.filter((k) => !q || (k.name + k.lord + k.deity + k.gana + spanText(k)).toLowerCase().includes(q))
    .map((k) => `<tr class="${myNak === k.i ? "me" : ""}"><td class="sp">${k.i + 1}</td>
     <td><span class="n">${k.name}</span>${myNak === k.i ? ' <span class="badge now">yours</span>' : ""}<br><span class="d" lang="hi">${k.deva}</span></td>
     <td class="sp">${spanText(k)}</td><td>${k.lord} <span class="sp">(${YEARS[k.lord]}y)</span></td>
     <td>${k.deity}</td><td>${k.gana}</td></tr>`).join("")
    || `<tr><td colspan="6" style="padding:20px;color:var(--dim)">Nothing matches.</td></tr>`;
}
renderNak(); $("#nakFilter").addEventListener("input", (e) => renderNak(e.target.value));

let CH = null;
function compute() {
  const p = place("b"), d = $("#bDate").value, noTime = $("#bNoTime").checked;
  const t = noTime ? "12:00" : ($("#bTime").value || "12:00");
  if (!d) return { err: "Please enter your date of birth." };
  if (!p) return { err: "Pick a place from the suggestions, or enter coordinates." };
  const [Y, M, D] = d.split("-").map(Number), [hh, mi] = t.split(":").map(Number);
  if (!validYMD(Y, M, D)) return { err: "That date is not a real calendar day." };
  const utcMs = wallToUTCms(p.zone, Y, M, D, hh, mi), off = tzOffsetAt(p.zone, new Date(utcMs));
  const jdUT = utcMs / 86400000 + 2440587.5;
  const jdTT = jdUT + deltaT(Y) / 86400;
  const ay = ayanamsa(jdUT);
  const sunT = sunLongitude(jdTT), moonT = moonLongitude(jdTT);
  const sunS = norm(sunT - ay), moonS = norm(moonT - ay);
  const ascT = ascendant(jdUT, p.lat, p.lng), ascS = norm(ascT - ay);
  const nkI = Math.min(26, Math.floor(moonS / NAKW)), nk = NAK[nkI];
  const posIn = (moonS - nk.start) / NAKW;
  const pada = Math.min(4, Math.floor(posIn * 4) + 1);
  return { p, Y, M, D, hh, mi, off, noTime, jdUT, jdTT, ay, sunT, sunS, moonT, moonS, ascT, ascS, nk, posIn, pada,
    sunNak: NAK[Math.min(26, Math.floor(sunS / NAKW))],
    ascSign: Math.floor(ascS / 30), moonSign: Math.floor(moonS / 30), sunSign: Math.floor(sunS / 30),
    sunTropSign: Math.floor(sunT / 30), name: $("#bName").value.trim() };
}
const house = (sign, asc) => ((sign - asc + 12) % 12) + 1;
const BOX = [[150,78],[75,28],[28,75],[75,150],[28,225],[75,272],[150,222],[225,272],[272,225],[225,150],[272,75],[225,28]];
function drawKundali(c) {
  let g = "";
  for (let b = 0; b < 12; b++) {
    const [cx, cy] = BOX[b], sign = (c.ascSign + b) % 12, items = [];
    if (b === 0) items.push(["as", "Asc " + dms(c.ascS - c.ascSign * 30)]);
    if (sign === c.sunSign) items.push(["gr", "Su " + dms(c.sunS - c.sunSign * 30)]);
    if (sign === c.moonSign) items.push(["gr mo", "Mo " + dms(c.moonS - c.moonSign * 30)]);
    g += `<text class="hn" x="${cx}" y="${cy - 26}" text-anchor="middle">${sign + 1}</text>`;
    items.forEach((it, k) => { g += `<text class="${it[0]}" x="${cx}" y="${cy + 2 + k * 15}" text-anchor="middle">${it[1]}</text>`; });
  }
  return `<svg class="kundali" viewBox="-16 -16 332 332" role="img" aria-label="North Indian kundali with ${SIGNS[c.ascSign][0]} ascendant">
    <rect class="fr" x="0" y="0" width="300" height="300"/>
    <path class="ln" d="M0 0 L300 300"/><path class="ln" d="M300 0 L0 300"/>
    <path class="ln" d="M150 0 L300 150 L150 300 L0 150 Z"/>${g}</svg>`;
}

function renderChart(c) {
  const asc = c.ascSign, sunH = house(c.sunSign, asc), moonH = house(c.moonSign, asc);
  const tropDiff = c.sunTropSign !== c.sunSign, noT = c.noTime;
  $("#oChart").innerHTML = `
  <div class="charts">
   <div>${drawKundali(c)}
    <p class="hint" style="text-align:center;margin-top:12px">The number in each box is the <b>sign</b>, not the house. The top box is always the 1st house; they run anticlockwise. Whole-sign houses.</p></div>
   <div>
    <div class="tiles">
     <div class="tile ${noT ? "" : "hi"}"><span class="lbl">Lagna (rising)</span>
       <b>${noT ? "Unknown" : SIGNS[asc][2] + " " + SIGNS[asc][0]}</b>
       <small>${noT ? "needs your birth time" : dms(c.ascS - asc * 30) + " · ruled by " + SIGNLORD[asc]}</small></div>
     <div class="tile"><span class="lbl">Moon sign (rashi)</span><b>${SIGNS[c.moonSign][2]} ${SIGNS[c.moonSign][0]}</b>
       <small>${dms(c.moonS - c.moonSign * 30)} · house ${noT ? "—" : moonH}</small></div>
     <div class="tile"><span class="lbl">Birth star</span><b style="font-size:20px">${c.nk.name}</b>
       <small>pada ${c.pada} · lord ${c.nk.lord}</small></div>
     <div class="tile"><span class="lbl">Sun sign (sidereal)</span><b>${SIGNS[c.sunSign][2]} ${SIGNS[c.sunSign][0]}</b>
       <small>${dms(c.sunS - c.sunSign * 30)} · house ${noT ? "—" : sunH}</small></div>
    </div>
    ${noT ? `<p class="err" style="margin-top:14px">Noon was assumed. The lagna is omitted — it cycles all twelve signs in a day. The Moon moves ~13° a day, so the nakshatra may be off by one.</p>` : ""}
    <div class="rows" style="margin-top:16px">
     <div class="rw"><span class="k">SUN SIGN</span><span class="v">
       Sidereal <b>${SIGNS[c.sunSign][0]}</b> · Tropical <b>${SIGNS[c.sunTropSign][1]}</b>
       ${tropDiff ? '<span class="badge warn">they differ</span>' : '<span class="badge ok">they agree</span>'}<br>
       <span style="color:var(--dim);font-size:13.5px">${tropDiff
         ? "Western horoscopes use the tropical zodiac. Subtracting the ayanamsa often moves the Sun back a sign. Neither zero point is 'wrong'."
         : "You were born far enough into the tropical sign that the ayanamsa does not push the Sun back a sign."}</span></span></div>
     ${noT ? "" : `<div class="rw"><span class="k">LAGNA LORD</span><span class="v"><b>${SIGNLORD[asc]}</b> rules your 1st house — ${HOUSEMEAN[0]}.</span></div>`}
     <div class="rw"><span class="k">MOON HOUSE</span><span class="v">${noT ? "Needs birth time." : `The Moon sits in your <b>${moonH}${["st","nd","rd"][moonH-1]||"th"} house</b> — ${HOUSEMEAN[moonH-1]}.`}</span></div>
     <div class="rw"><span class="k">SUN HOUSE</span><span class="v">${noT ? "Needs birth time." : `The Sun sits in your <b>${sunH}${["st","nd","rd"][sunH-1]||"th"} house</b> — ${HOUSEMEAN[sunH-1]}.`}</span></div>
    </div>
    <div class="work">
     birth ${pad2(c.hh)}:${pad2(c.mi)} at ${esc(c.p.name)} → ${fmtOff(c.off)} → JD <b>${c.jdUT.toFixed(5)}</b> UT · TT = UT + ΔT<br>
     ayanamsa (Lahiri) = <b>${dms(c.ay)}</b><br>
     Sun tropical ${c.sunT.toFixed(3)}° − ayanamsa = sidereal <b>${c.sunS.toFixed(3)}°</b><br>
     Moon tropical ${c.moonT.toFixed(3)}° − ayanamsa = sidereal <b>${c.moonS.toFixed(3)}°</b><br>
     ${noT ? "" : `ascendant tropical ${c.ascT.toFixed(3)}° − ayanamsa = sidereal <b>${c.ascS.toFixed(3)}°</b><br>`}
     ${c.moonS.toFixed(3)}° ÷ 13.333 → nakshatra <b>${c.nk.i + 1}</b> (${c.nk.name}), <b>${(c.posIn * 100).toFixed(1)}%</b> through it
    </div>
    <div class="cite"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/></svg>
      <span>Sun and Moon on Terrestrial Time (ΔT). Ascendant from sidereal time and latitude. Only Sun, Moon and lagna are shown.</span></div>
   </div></div>`;
  myNak = c.nk.i; renderNak($("#nakFilter").value);
}

function renderDasha(c) {
  const YEARLEN = 365.2425, bal = (1 - c.posIn) * YEARS[c.nk.lord];
  const start = Date.UTC(c.Y, c.M - 1, c.D);
  let cur = start, rows = [], li = LORDS.indexOf(c.nk.lord), now = Date.now();
  for (let i = 0; i < 10; i++) {
    const lord = LORDS[(li + i) % 9], yrs = i === 0 ? bal : YEARS[lord];
    const end = cur + yrs * YEARLEN * 86400000;
    rows.push({ lord, yrs, s: new Date(cur), e: new Date(end), first: i === 0 }); cur = end;
  }
  const fmt = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  const act = rows.find((r) => now >= r.s.getTime() && now < r.e.getTime());
  let sub = "";
  if (act) {
    const ai = LORDS.indexOf(act.lord); let cc = act.s.getTime(); const subs = [];
    for (let i = 0; i < 9; i++) {
      const l = LORDS[(ai + i) % 9], yy = act.yrs * YEARS[l] / 120;
      const e = cc + yy * YEARLEN * 86400000; subs.push({ l, s: new Date(cc), e: new Date(e) }); cc = e;
    }
    const sa = subs.find((s) => now >= s.s.getTime() && now < s.e.getTime());
    sub = subs.map((s) => `<div class="rw ${s === sa ? "now" : ""}"><span class="k">${act.lord.slice(0, 2).toUpperCase()}–${s.l.slice(0, 2).toUpperCase()}</span>
     <span class="v">${fmt(s.s)} → ${fmt(s.e)}${s === sa ? '<span class="badge now">current</span>' : ""}</span></div>`).join("");
  }
  $("#oDasha").innerHTML = `
   <div class="tiles">
    <div class="tile"><span class="lbl">Birth star</span><b style="font-size:19px">${c.nk.name}</b>
      <small>lord ${c.nk.lord} · ${YEARS[c.nk.lord]}-year period</small></div>
    <div class="tile"><span class="lbl">Balance at birth</span><b>${bal.toFixed(2)} yrs</b>
      <small>${(100 - c.posIn * 100).toFixed(1)}% of the ${c.nk.lord} period left</small></div>
    <div class="tile hi"><span class="lbl">Mahadasha now</span><b style="font-size:22px">${act ? act.lord : "—"}</b>
      <small>${act ? "until " + fmt(act.e) : "outside the computed span"}</small></div>
    <div class="tile"><span class="lbl">Cycle closes</span><b style="font-size:18px">${fmt(rows[8].e)}</b>
      <small>120 years from the cycle start</small></div>
   </div>
   <h4 style="margin:22px 0 2px">Mahadasha sequence</h4>
   <div class="rows">${rows.slice(0, 9).map((r) => `<div class="rw ${r === act ? "now" : ""}">
     <span class="k">${r.lord.toUpperCase()}</span><span class="v">${fmt(r.s)} → ${fmt(r.e)}
     <span style="color:var(--dim)">· ${r.yrs.toFixed(2)} yrs</span>
     ${r.first ? '<span class="badge">part period at birth</span>' : ""}
     ${r === act ? '<span class="badge now">current</span>' : ""}</span></div>`).join("")}</div>
   ${act ? `<h4 style="margin:22px 0 2px">Antardasha inside ${act.lord}</h4><div class="rows">${sub}</div>` : ""}
   <div class="work">Moon <b>${(c.posIn * 100).toFixed(2)}%</b> through ${c.nk.name}<br>
    balance = (1 − ${c.posIn.toFixed(4)}) × ${YEARS[c.nk.lord]} = <b>${bal.toFixed(3)} years</b></div>
   <div class="cite"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/></svg>
    <span>Vimshottari from BPHS (120 years). ${c.noTime ? "<b>Unknown birth time: dates can be a year or more out.</b> " : ""}Read dates as seasons.</span></div>`;
}

const MASTERS = new Set([11, 22, 33]);
const KARMA = new Set([13, 14, 16, 19]);
function digitSum(n) { return String(Math.abs(n | 0)).split("").reduce((a, b) => a + +b, 0); }
function reduceDetailed(n, keepMaster) {
  n = Math.abs(n | 0);
  const karmic = [], steps = [n];
  while (n > 9) {
    if (KARMA.has(n)) karmic.push(n);
    if (keepMaster && MASTERS.has(n)) break;
    n = digitSum(n); steps.push(n);
  }
  return { value: n, karmic, steps };
}
const PYTH = (c) => ((c.charCodeAt(0) - 65) % 9) + 1;
const CHAL = { A:1,I:1,J:1,Q:1,Y:1,B:2,K:2,R:2,C:3,G:3,L:3,S:3,D:4,M:4,T:4,E:5,H:5,N:5,X:5,U:6,V:6,W:6,O:7,Z:7,F:8,P:8 };
function isVowelAt(chars, i) {
  const ch = chars[i];
  if ("AEIOU".includes(ch)) return true;
  if (ch !== "Y") return false;
  const next = chars[i + 1];
  if (!chars[i - 1] && next && "AEIOU".includes(next)) return false;
  if (next && "AEIOU".includes(next)) return false;
  return true;
}
function nameNum(n, map, pred) {
  const ls = n.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const used = ls.filter((c, i) => !pred || pred(ls, i));
  if (!used.length) return null;
  const sum = used.reduce((a, c) => a + map(c), 0);
  return { sum, ...reduceDetailed(sum, true) };
}
const LIFE = {
  1: ["The Initiator", "Leads, dislikes being led. Direct, original, impatient with committees."],
  2: ["The Diplomat", "Works through pairing and timing rather than force."],
  3: ["The Communicator", "Expression and range. Scatters without a deadline."],
  4: ["The Builder", "Structure, method, endurance."],
  5: ["The Restless", "Change and appetite for the new."],
  6: ["The Caretaker", "Responsibility for people, home and craft."],
  7: ["The Seeker", "Analysis over impulse; patient and private."],
  8: ["The Strategist", "Material ambition and consequence."],
  9: ["The Completer", "Endings, scale, service."],
  11: ["Master 11 — The Channel", "Kept unreduced. Heightened sensitivity."],
  22: ["Master 22 — The Builder", "Kept unreduced. Vision plus patience."],
  33: ["Master 33 — The Teacher", "Kept unreduced and rare."]
};
const KMEAN = { 13: "13/4 — effort without shortcuts.", 14: "14/5 — freedom used well.", 16: "16/7 — pride giving way to insight.", 19: "19/1 — independence that still serves." };
function loShu(d, m, y) {
  const raw = `${pad2(d)}${pad2(m)}${y}`;
  const g = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  for (const ch of raw) { const n = +ch; if (n >= 1 && n <= 9) g[n]++; }
  return g;
}
function renderNum(c) {
  const rm = reduceDetailed(c.M, false);
  const rd = reduceDetailed(c.D, false);
  const yearDigits = digitSum(c.Y);
  const ry = reduceDetailed(yearDigits, false);
  const total = rm.value + rd.value + ry.value;
  const lp = reduceDetailed(total, true);
  const meta = LIFE[lp.value] || LIFE[7];
  const yr = new Date().getFullYear();
  const py = reduceDetailed(rm.value + rd.value + reduceDetailed(yr, false).value, false).value;
  const grid = loShu(c.D, c.M, c.Y);
  const missing = [1,2,3,4,5,6,7,8,9].filter((n) => !grid[n]);
  let nb = "";
  if (c.name) {
    const p = { e: nameNum(c.name, PYTH), s: nameNum(c.name, PYTH, isVowelAt), r: nameNum(c.name, PYTH, (cs, i) => !isVowelAt(cs, i)) };
    const h = { e: nameNum(c.name, (x) => CHAL[x] || 0), s: nameNum(c.name, (x) => CHAL[x] || 0, isVowelAt), r: nameNum(c.name, (x) => CHAL[x] || 0, (cs, i) => !isVowelAt(cs, i)) };
    const row = (k, a, b) => `<div class="rw"><span class="k">${k}</span><span class="v">Pythagorean <b>${a ? a.value : "—"}</b>
      <span style="color:var(--dim)">(sum ${a ? a.sum : 0})</span> · Chaldean <b>${b ? b.value : "—"}</b>
      <span style="color:var(--dim)">(sum ${b ? b.sum : 0})</span>
      ${a && a.karmic.length ? '<span class="badge warn">karmic ' + a.karmic.join(",") + "</span>" : ""}</span></div>`;
    nb = `<h4 style="margin:22px 0 2px">From the name</h4><div class="rows">${row("EXPRESSION", p.e, h.e)}${row("SOUL URGE", p.s, h.s)}${row("PERSONALITY", p.r, h.r)}</div>
      <p class="hint" style="margin-top:10px">Y is counted as a vowel except as a leading/glide consonant (Yvette). Pythagorean uses alphabet position; Chaldean uses sound and never assigns 9.</p>`;
  }
  $("#oNum").innerHTML = `
   <div class="tiles">
    <div class="tile hi"><span class="lbl">Life path</span><b style="font-size:38px">${lp.karmic.length ? lp.karmic[0] + "/" + lp.value : lp.value}</b><small>${meta[0]}</small></div>
    <div class="tile"><span class="lbl">Personal year ${yr}</span><b>${py}</b><small>the cycle you are in now</small></div>
    <div class="tile"><span class="lbl">Birth day</span><b>${c.D}${c.D === 11 || c.D === 22 ? " · master day" : ""}</b><small>reduced component ${rd.value}</small></div>
    <div class="tile ${lp.karmic.length ? "bad" : ""}"><span class="lbl">Karmic compounds</span><b style="font-size:19px">${lp.karmic.length ? lp.karmic.join(", ") : "None"}</b><small>from unreduced totals</small></div>
   </div>
   <p style="margin-top:16px;color:var(--muted);font-size:15px">${meta[1]} ${lp.karmic.map((k) => KMEAN[k]).join(" ")}</p>
   <div class="work">month <b>${c.M}</b>→${rm.steps.join("→")} · day <b>${c.D}</b>→${rd.steps.join("→")} · year <b>${c.Y}</b> (${yearDigits})→${ry.steps.join("→")}<br>
    ${rm.value}+${rd.value}+${ry.value} = <b>${total}</b> → ${lp.steps.join(" → ")} → life path <b>${lp.value}</b></div>
   <h4 style="margin:22px 0 8px">Lo Shu from the birth date</h4>
   <div class="loshu">${[4,9,2,3,5,7,8,1,6].map((n) => `<i class="${grid[n] ? "on" : ""}">${n}<small style="font-size:9px;color:var(--dim)">×${grid[n]}</small></i>`).join("")}</div>
   <p class="hint">${missing.length ? "Empty houses: " + missing.join(", ") : "Complete grid — every digit 1–9 appears."}</p>
   ${nb}
   <div class="cite"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/></svg>
    <span>Life-path practice as used today is a 20th-century lineage (Cheiro, Campbell, Jordan). We mark it as modern on purpose. Karmic 13/4, 14/5, 16/7, 19/1 are read from the compound before the last reduction — not from the already-reduced 1–9.</span></div>`;
}

const RAHU = [8,2,7,5,6,4,3], YAMA = [5,4,3,2,1,7,6], GULI = [7,6,5,4,3,2,1];
const DAYN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const CYC = ["Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog"];
const CQ = { Udveg:["n","Sun — tension; used for government dealings"], Char:["n","Venus — movable; good for travel"],
  Labh:["g","Mercury — gain; good for business"], Amrit:["g","Moon — the most auspicious"],
  Kaal:["b","Saturn — delay; avoid new starts"], Shubh:["g","Jupiter — good for ceremony"], Rog:["b","Mars — conflict; avoid"] };
const NIGHT_START = { 0: "Shubh", 1: "Amrit", 2: "Kaal", 3: "Labh", 4: "Udveg", 5: "Shubh", 6: "Amrit" };

function calcDay() {
  const P = place("d") || place("b"), out = $("#oDay");
  if (!P) { out.innerHTML = '<p class="err">Pick a place from the suggestions.</p>'; return; }
  const dv = $("#dDate").value; if (!dv) { out.innerHTML = '<p class="err">Pick a date.</p>'; return; }
  const [Y, M, D] = dv.split("-").map(Number);
  if (!validYMD(Y, M, D)) { out.innerHTML = '<p class="err">That date is not real.</p>'; return; }
  const t = sunTimes(Y, M, D, P.lat, P.lng);
  if (t.polar) { out.innerHTML = `<p class="err">${t.polar}</p>`; return; }
  const next = new Date(Date.UTC(Y, M - 1, D + 1));
  const t2 = sunTimes(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), P.lat, P.lng);
  const tz = tzOffsetAt(P.zone, new Date(jdToMs(t.rise)));
  const dow = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
  const len = t.set - t.rise, seg = len / 8, mins = Math.round(len * 1440), segMin = Math.round(seg * 1440);
  const win = (i) => ({ s: t.rise + (i - 1) * seg, e: t.rise + i * seg });
  const r = win(RAHU[dow]), ya = win(YAMA[dow]), g = win(GULI[dow]);
  const mu = len / 15, abh = { s: t.rise + 7 * mu, e: t.rise + 8 * mu };
  const F = (w) => hhmm(w.s, tz) + " – " + hhmm(w.e, tz);
  const nowJd = Date.now() / 86400000 + 2440587.5;
  let bar = "";
  for (let i = 1; i <= 8; i++) {
    const k = i === RAHU[dow] ? "rahu" : i === YAMA[dow] ? "yama" : i === GULI[dow] ? "guli" : "";
    bar += `<div class="${k}"><span>${i}</span></div>`;
  }
  const st = (dow * 3) % 7;
  let chog = "";
  for (let i = 0; i < 8; i++) {
    const nm = CYC[(st + i) % 7], q = CQ[nm], w = win(i + 1);
    const live = nowJd >= w.s && nowJd < w.e;
    chog += `<div class="cg ${q[0]}${live ? " live" : ""}"><b>${nm}${live ? " ●" : ""}</b><div class="t">${F(w)}</div>
     <div class="hint" style="margin-top:4px">${q[1]}</div></div>`;
  }
  let night = "";
  if (t2 && !t2.polar && t2.rise) {
    const nlen = t2.rise - t.set, nseg = nlen / 8;
    const n0 = CYC.indexOf(NIGHT_START[dow]);
    for (let i = 0; i < 8; i++) {
      const nm = CYC[(n0 + i) % 7], q = CQ[nm], w = { s: t.set + i * nseg, e: t.set + (i + 1) * nseg };
      const live = nowJd >= w.s && nowJd < w.e;
      night += `<div class="cg ${q[0]}${live ? " live" : ""}"><b>${nm}${live ? " ●" : ""}</b><div class="t">${F(w)}</div></div>`;
    }
  }
  const wed = dow === 3;
  out.innerHTML = `
  <div style="margin-top:16px">
   <div class="tiles">
    <div class="tile"><span class="lbl">Sunrise</span><b>${hhmm(t.rise, tz)}</b><small>${esc(P.name)}</small></div>
    <div class="tile"><span class="lbl">Sunset</span><b>${hhmm(t.set, tz)}</b><small>${DAYN[dow]}</small></div>
    <div class="tile"><span class="lbl">Daylight</span><b>${Math.floor(mins / 60)}h ${pad2(mins % 60)}m</b><small>each eighth = ${segMin} min</small></div>
    <div class="tile ${wed ? "" : "good"}"><span class="lbl">Abhijit muhurta</span><b style="font-size:18px">${F(abh)}</b>
      <small>${wed ? "Often void on Wednesday" : "8th of 15 muhurtas, centred on midday"}</small></div>
   </div>
   <div class="daybar" role="img" aria-label="Eight parts of daylight">${bar}</div>
   <div class="legend">
    <span><i style="background:rgba(255,143,200,.55)"></i>Rahu kaal — part ${RAHU[dow]}</span>
    <span><i style="background:rgba(255,201,120,.5)"></i>Yamaganda — part ${YAMA[dow]}</span>
    <span><i style="background:rgba(95,220,255,.45)"></i>Gulika — part ${GULI[dow]}</span></div>
   <div class="rows" style="margin-top:16px">
    <div class="rw"><span class="k">RAHU KAAL</span><span class="v"><b>${F(r)}</b><span class="badge warn">avoid new starts</span></span></div>
    <div class="rw"><span class="k">YAMAGANDA</span><span class="v"><b>${F(ya)}</b></span></div>
    <div class="rw"><span class="k">GULIKA</span><span class="v"><b>${F(g)}</b></span></div></div>
   <h4 style="margin:22px 0 2px">Choghadiya — daytime</h4>
   <p class="hint">${DAYN[dow]} opens with <b>${CYC[st]}</b>.</p>
   <div class="chog">${chog}</div>
   ${night ? `<h4 style="margin:22px 0 2px">Choghadiya — night (sunset → next sunrise)</h4><div class="chog">${night}</div>` : ""}
   <div class="work">daylight <b>${mins} min</b> ÷ 8 = <b>${segMin} min</b> · timezone ${fmtOff(tz)}<br>
    ${DAYN[dow]} → rahu part <b>${RAHU[dow]}</b></div>
   <div class="cite"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/></svg>
    <span>Weekday assignments follow standard panchang practice; Abhijit from Muhurta Chintamani. Night sequence starts from the weekday's night-opening name. Sunrise uses −0.833° altitude.</span></div>
  </div>`;
}

const MAJ = [["0","The Fool","Folly, extravagance; reversed, negligence.","New beginnings, a leap of faith.",1],
["I","The Magician","Skill, diplomacy — also sickness and snares.","Manifestation, willpower.",1],
["II","The High Priestess","Secrets, mystery, the future not yet revealed.","Intuition and the subconscious.",0],
["III","The Empress","Fruitfulness, action — also difficulty and doubt.","Abundance, nurture.",1],
["IV","The Emperor","Stability, power, protection, authority.","Structure, control.",0],
["V","The Hierophant","Marriage and alliance — also captivity.","Tradition, institutions.",1],
["VI","The Lovers","Attraction, love, trials overcome.","Union, a choice between paths.",0],
["VII","The Chariot","Succour; also war, triumph, trouble.","Willpower, victory.",1],
["VIII","Strength","Power, courage, magnanimity.","Inner strength, patience.",0],
["IX","The Hermit","Prudence — and especially treason in one reading.","Solitude, inner guidance.",1],
["X","Wheel of Fortune","Destiny, fortune, elevation, luck.","Cycles, turning points.",0],
["XI","Justice","Equity, rightness; the deserving side wins in law.","Fairness, accountability.",0],
["XII","The Hanged Man","Wisdom, sacrifice, intuition, prophecy.","Surrender, a change of view.",0],
["XIII","Death","End, mortality, destruction; loss of a benefactor.","Transformation and endings.",1],
["XIV","Temperance","Economy, moderation, management.","Balance, blending.",0],
["XV","The Devil","Ravage, force, fatality; not evil merely because fated.","Bondage, shadow material.",1],
["XVI","The Tower","Misery, calamity, unforeseen catastrophe.","Sudden upheaval that clears the ground.",0],
["XVII","The Star","Loss and privation — or hope and bright prospects.","Hope after the storm.",1],
["XVIII","The Moon","Hidden enemies, deception, occult forces.","Illusion, the unconscious.",1],
["XIX","The Sun","Material happiness, fortunate marriage, contentment.","Joy, vitality, clarity.",0],
["XX","Judgement","Change of position, renewal — or total loss by lawsuit.","Awakening, a calling.",1],
["XXI","The World","Assured success, voyage, change of place.","Completion and wholeness.",0]];
const POS = ["Past", "Present", "Path"];
const BACK = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" stroke-width="1"/><circle cx="20" cy="20" r="6" stroke-width="1"/>
<path d="M20 3v6M20 31v6M3 20h6M31 20h6M8 8l4 4M32 32l-4-4M32 8l-4 4M8 32l4-4"/></svg>`;
function shuffle(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
let draw = [], flip = 0;
function deal() {
  draw = shuffle(MAJ).slice(0, 3); flip = 0;
  $("#tgrid").innerHTML = draw.map((c, i) => `<div><button class="tcard" data-i="${i}" type="button" aria-label="Turn the ${POS[i]} card">
   <div class="tin"><div class="tf tb">${BACK}</div>
   <div class="tf tfr"><div><div class="rn">${c[0]}</div><div class="nm">${c[1]}</div></div></div></div></button>
   <div class="tpos">${POS[i]}</div></div>`).join("");
  $("#tread").innerHTML = '<p class="hint" style="text-align:center">Tap each card to turn it.</p>';
  document.querySelectorAll(".tcard").forEach((b) => b.onclick = () => {
    if (b.classList.contains("flip")) return; b.classList.add("flip"); flip++;
    if (flip === 3) showRead();
    else $("#tread").innerHTML = `<p class="hint" style="text-align:center">${3 - flip} card${flip === 2 ? "" : "s"} still face down.</p>`;
  });
}
function showRead() {
  const dv = draw.filter((c) => c[4]).length;
  $("#tread").innerHTML = draw.map((c, i) => `<div class="tcmp">
   <h4>${POS[i]} — ${c[1]} <span class="mono" style="color:var(--gold);font-size:11px">${c[0]}</span>
    ${c[4] ? '<span class="badge warn">sources diverge</span>' : '<span class="badge ok">sources agree</span>'}</h4>
   <div class="two"><div><span class="lbl">Waite, 1911</span><p>${c[2]}</p></div>
    <div><span class="lbl">Modern deck usage</span><p>${c[3]}</p></div></div></div>`).join("") +
    `<div class="cite"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/></svg>
     <span>${dv ? dv + " of your 3 cards read differently in Waite than in modern practice. " : ""}Pictorial Key (1911), public domain. Symbolic, not predictive.</span></div>`;
}

const TITHIN = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima"];
const YOGAN = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
const KARMOV = ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti"];
function panchang(jdUT, Y) {
  const jdTT = jdUT + deltaT(Y) / 86400, ay = ayanamsa(jdUT);
  const sT = sunLongitude(jdTT), mT = moonLongitude(jdTT), diff = norm(mT - sT);
  const ti = Math.floor(diff / 12) + 1, kn = Math.floor(diff / 6) + 1;
  let kar; if (kn === 1) kar = "Kimstughna"; else if (kn >= 58) kar = ["Shakuni","Chatushpada","Naga"][kn - 58]; else kar = KARMOV[(kn - 2) % 7];
  const ms = norm(mT - ay), ss = norm(sT - ay);
  return { tithi: ti, paksha: ti <= 15 ? "Shukla" : "Krishna",
    tname: ti === 15 ? "Purnima" : ti === 30 ? "Amavasya" : TITHIN[(ti - 1) % 15],
    yoga: YOGAN[Math.floor(norm(sT + mT) / NAKW)], karana: kar,
    moonS: ms, sunS: ss, nakI: Math.min(26, Math.floor(ms / NAKW)), moonSign: Math.floor(ms / 30), sunSign: Math.floor(ss / 30),
    illum: Math.round((1 - cos(diff)) / 2 * 100) };
}
const TARAS = [["Janma","neutral","Your own star. Reflect and plan rather than launch."],
["Sampat","good","The wealth tara. Favoured for money matters."],
["Vipat","bad","The danger tara. Texts advise postponing travel and new commitments."],
["Kshema","good","Wellbeing. Good for health, home and repair."],
["Pratyari","bad","The obstacle tara. Expect friction."],
["Sadhaka","good","Achievement. Favoured for finishing and tests."],
["Vadha","bad","The destruction tara — wait it out."],
["Mitra","good","The friend tara. Meetings, reconciliation, asking for help."],
["Parama Mitra","good","The most favourable of the nine."]];
const CB = [null,"good","neutral","good","bad","neutral","good","good","bad","bad","good","good","bad"];
const CBTXT = [null,"Moon on your own sign — inward and self-focused.",
"Moon in the 2nd — money and family come forward.",
"Moon in the 3rd — energy, courage, short journeys.",
"Moon in the 4th — domestic weight.",
"Moon in the 5th — creative, scattered.",
"Moon in the 6th — competition and clearing obstacles.",
"Moon in the 7th — partnership is favoured.",
"Moon in the 8th — inward and unsettled. Rest.",
"Moon in the 9th — restless in transit.",
"Moon in the 10th — work and public action.",
"Moon in the 11th — gains and networks. Classically the best.",
"Moon in the 12th — depleting; retreat and sleep."];
function taraBala(birthNak, todayNak) {
  const n = ((todayNak - birthNak + 27) % 27) + 1, t = ((n - 1) % 9);
  return { n, cycle: Math.floor((n - 1) / 9) + 1, name: TARAS[t][0], q: TARAS[t][1], txt: TARAS[t][2], idx: t + 1 };
}
function chandraBala(birthSign, todaySign) {
  const h = ((todaySign - birthSign + 12) % 12) + 1; return { h, q: CB[h], txt: CBTXT[h] };
}
const SUNGOOD = [3, 6, 10, 11];
function renderDaily() {
  if (!CH) return;
  const P = place("d") || place("b"), out = $("#oDaily");
  const dv = $("#kDate").value; if (!dv || !P) return;
  const [Y, M, D] = dv.split("-").map(Number);
  if (!validYMD(Y, M, D)) { out.innerHTML = '<p class="err">That date is not real.</p>'; return; }
  const t = sunTimes(Y, M, D, P.lat, P.lng);
  if (t.polar) { out.innerHTML = `<p class="err">${t.polar}</p>`; return; }
  const tz = tzOffsetAt(P.zone, new Date(jdToMs(t.rise)));
  const pn = panchang(t.rise, Y);
  const tb = taraBala(CH.nk.i, pn.nakI), cb = chandraBala(CH.moonSign, pn.moonSign);
  const sunH = ((pn.sunSign - CH.moonSign + 12) % 12) + 1, sunOK = SUNGOOD.includes(sunH);
  let sc = 5; sc += tb.q === "good" ? 2 : tb.q === "bad" ? -2 : 0; sc += cb.q === "good" ? 2 : cb.q === "bad" ? -2 : 0; sc += sunOK ? 1 : -1;
  sc = Math.max(0, Math.min(10, sc));
  const verdict = sc >= 8 ? ["A strong day for you","var(--mint)"] : sc >= 6 ? ["A workable day","var(--cyan)"] : sc >= 4 ? ["A mixed day — pick your moments","var(--gold)"] : ["A day to hold steady","var(--rose)"];
  const col = (q) => q === "good" ? "var(--mint)" : q === "bad" ? "var(--rose)" : "var(--gold)";
  const bar = (nm, q, txt, w) => `<div class="bar"><span class="nm">${nm}</span>
   <span class="tr"><i style="width:${w}%;background:${col(q)}"></i></span><span class="vl">${txt}</span></div>`;
  const dow = new Date(Date.UTC(Y, M - 1, D)).getUTCDay(), len = t.set - t.rise, seg = len / 8;
  const st = (dow * 3) % 7, GOODC = ["Amrit","Shubh","Labh"];
  const rs = t.rise + (RAHU[dow] - 1) * seg, re = t.rise + RAHU[dow] * seg;
  const wins = [];
  for (let i = 0; i < 8; i++) {
    const nm = CYC[(st + i) % 7]; if (!GOODC.includes(nm)) continue;
    const a = t.rise + i * seg, b = t.rise + (i + 1) * seg; if (a < re && b > rs) continue;
    wins.push(`${nm} ${hhmm(a, tz)}–${hhmm(b, tz)}`);
  }
  const dt = new Date(Date.UTC(Y, M - 1, D));
  out.innerHTML = `
  <div class="score">
   <div class="big" style="color:${verdict[1]}">${sc}<i>/10</i></div>
   <div class="txt"><b>${verdict[0]}</b>
    <span>${dt.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"UTC" })} · ${esc(P.name)}</span></div>
  </div>
  <div class="bars">
   ${bar("Tara Bala", tb.q, `${tb.name} (${tb.idx} of 9)`, tb.q === "good" ? 100 : tb.q === "bad" ? 25 : 60)}
   ${bar("Chandra Bala", cb.q, `Moon in your ${cb.h}${["st","nd","rd"][cb.h-1]||"th"}`, cb.q === "good" ? 100 : cb.q === "bad" ? 25 : 60)}
   ${bar("Sun from Moon", sunOK ? "good" : "bad", `${sunH}${["st","nd","rd"][sunH-1]||"th"} house`, sunOK ? 100 : 35)}
  </div>
  <div class="rows" style="margin-top:18px">
   <div class="rw"><span class="k">TARA BALA</span><span class="v"><b>${tb.name}</b>
    <span class="badge ${tb.q === "good" ? "ok" : tb.q === "bad" ? "warn" : ""}">${tb.q}</span><br>
    <span style="color:var(--muted);font-size:13.5px">${tb.txt} Counted from <b>${CH.nk.name}</b> to today's <b>${NAK[pn.nakI].name}</b> — ${tb.n} stars, cycle ${tb.cycle} of 3.</span></span></div>
   <div class="rw"><span class="k">CHANDRA BALA</span><span class="v"><b>${SIGNS[pn.moonSign][0]}</b>
    <span class="badge ${cb.q === "good" ? "ok" : cb.q === "bad" ? "warn" : ""}">${cb.q}</span><br>
    <span style="color:var(--muted);font-size:13.5px">${cb.txt}</span></span></div>
   <div class="rw"><span class="k">BEST WINDOWS</span><span class="v">${wins.length ? wins.join(" · ") : "No auspicious daytime Choghadiya falls clear of rahu kaal."}</span></div>
  </div>
  <h4 style="margin:22px 0 2px">The day's panchang</h4>
  <div class="limbs">
   <div class="limb"><span class="lbl">Vara</span><b>${DAYN[dow]}</b><small>sunrise ${hhmm(t.rise, tz)}</small></div>
   <div class="limb"><span class="lbl">Tithi</span><b>${pn.tname}</b><small>${pn.paksha} paksha · ${pn.illum}% lit</small></div>
   <div class="limb"><span class="lbl">Nakshatra</span><b>${NAK[pn.nakI].name}</b><small>lord ${NAK[pn.nakI].lord}</small></div>
   <div class="limb"><span class="lbl">Yoga</span><b>${pn.yoga}</b></div>
   <div class="limb"><span class="lbl">Karana</span><b>${pn.karana}</b></div>
  </div>
  <div class="work">score = 5 ${tb.q === "good" ? "+2" : tb.q === "bad" ? "−2" : "+0"} (tara) ${cb.q === "good" ? "+2" : cb.q === "bad" ? "−2" : "+0"} (chandra) ${sunOK ? "+1" : "−1"} (sun) = <b>${sc}</b></div>
  <div class="cite"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/></svg>
   <span>The 0–10 figure is our arithmetic on Tara Bala, Chandra Bala and Sun-from-Moon — an index of classical favourability, not a prediction.</span></div>`;
}

function ord(n) { return n + (["st","nd","rd"][n - 1] || "th"); }
function plainText(c) {
  const noT = c.noTime, L = [];
  L.push("Here is what your birth chart says, without the Sanskrit.");
  if (!noT) L.push(`RISING SIGN — ${SIGNS[c.ascSign][0]} (${SIGNS[c.ascSign][1]}) was climbing over the eastern horizon. It is the lens everything else is read through. Yours is ruled by ${SIGNLORD[c.ascSign]}.`);
  else L.push("RISING SIGN — not shown, because you did not give a birth time. Guessing it would be worse than leaving it out.");
  L.push(`MOON SIGN — your Moon was in ${SIGNS[c.moonSign][0]} (${SIGNS[c.moonSign][1]}). When an Indian astrologer asks for your "rashi", this is what they mean.`);
  L.push(`BIRTH STAR — ${c.nk.name}, quarter ${c.pada}. Its ruling planet, ${c.nk.lord}, decides where your life-period clock starts.`);
  const diff = c.sunTropSign !== c.sunSign;
  L.push(`SUN SIGN — ${SIGNS[c.sunSign][0]} in the Indian system. ${diff ? `A newspaper horoscope would call you ${SIGNS[c.sunTropSign][1]}. Both measure from different starting points, about 24 degrees apart.` : `Your Western sun sign is also ${SIGNS[c.sunTropSign][1]}.`}`);
  if (!noT) L.push(`WHERE THEY SIT — the Moon falls in your ${ord(house(c.moonSign, c.ascSign))} house (${HOUSEMEAN[house(c.moonSign, c.ascSign) - 1]}) and the Sun in your ${ord(house(c.sunSign, c.ascSign))} (${HOUSEMEAN[house(c.sunSign, c.ascSign) - 1]}).`);
  const bal = (1 - c.posIn) * YEARS[c.nk.lord];
  let cur = Date.UTC(c.Y, c.M - 1, c.D), li = LORDS.indexOf(c.nk.lord), now = Date.now(), run = null, ends = null;
  for (let i = 0; i < 10; i++) {
    const l = LORDS[(li + i) % 9], y = i === 0 ? bal : YEARS[l], e = cur + y * 365.2425 * 86400000;
    if (now >= cur && now < e) { run = l; ends = new Date(e); break; } cur = e;
  }
  if (run) L.push(`LIFE PERIOD — you are in a ${run} period, running to about ${ends.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}. Treat the end date as a season, not a deadline.`);
  L.push("ONE HONEST NOTE — everything above is arithmetic on real astronomy plus named classical rules. That makes it checkable. It does not make it evidence. Read it as a mirror, not a forecast.");
  return L;
}
function shareUrl() {
  const url = new URL(location.href);
  const p = CHOSEN.b;
  url.searchParams.set("dob", $("#bDate").value);
  if (!$("#bNoTime").checked) url.searchParams.set("time", $("#bTime").value);
  else url.searchParams.delete("time");
  if ($("#bName").value.trim()) url.searchParams.set("name", $("#bName").value.trim());
  else url.searchParams.delete("name");
  if (p) url.searchParams.set("place", p.label);
  return url.toString();
}
function renderPlain(c) {
  const L = plainText(c);
  $("#oPlain").innerHTML = `<div class="plain">${L.map((t, i) => {
    const m = t.match(/^([A-Z][A-Z \u2014-]+?) — /);
    return i === 0 ? `<p>${esc(t)}</p>` : `<p>${m ? `<b>${esc(m[1])}</b> — ${esc(t.slice(m[0].length))}` : esc(t)}</p>`;
  }).join("")}</div>
  <div class="shareRow">
    <button class="btn" id="shareBtn" type="button">Share this summary</button>
    <button class="btn ghost" id="copyBtn" type="button">Copy as text</button>
    <button class="btn ghost" id="linkBtn" type="button">Copy chart link</button>
  </div>`;
  const txt = "My MeriKismat chart\n\n" + L.join("\n\n") + "\n\n" + shareUrl();
  $("#copyBtn").onclick = async () => { try { await navigator.clipboard.writeText(txt); toast("Copied"); } catch { toast("Could not copy"); } };
  $("#linkBtn").onclick = async () => { try { await navigator.clipboard.writeText(shareUrl()); toast("Link copied"); } catch { toast("Could not copy"); } };
  $("#shareBtn").onclick = async () => {
    if (navigator.share) { try { await navigator.share({ title: "My MeriKismat chart", text: txt }); } catch (e) {} }
    else $("#copyBtn").click();
  };
}

function persist() {
  if (!$("#bRemember").checked) { try { localStorage.removeItem(STORAGE); } catch {} return; }
  try {
    localStorage.setItem(STORAGE, JSON.stringify({
      name: $("#bName").value, date: $("#bDate").value, time: $("#bTime").value, noTime: $("#bNoTime").checked,
      city: $("#bCity").value, place: CHOSEN.b, lat: $("#bLat").value, lng: $("#bLng").value, zone: $("#bZone").value,
      dCity: $("#dCity").value, dPlace: CHOSEN.d
    }));
  } catch {}
}
function applySaved(s) {
  if (!s) return;
  if (s.name) $("#bName").value = s.name;
  if (s.date) $("#bDate").value = s.date;
  if (s.time) $("#bTime").value = s.time;
  $("#bNoTime").checked = !!s.noTime; $("#bTime").disabled = !!s.noTime;
  if (s.city) $("#bCity").value = s.city;
  if (s.place) CHOSEN.b = s.place;
  if (s.lat) $("#bLat").value = s.lat;
  if (s.lng) $("#bLng").value = s.lng;
  if (s.zone) $("#bZone").value = s.zone;
  if (s.dCity) $("#dCity").value = s.dCity;
  if (s.dPlace) CHOSEN.d = s.dPlace;
}

function run() {
  const err = $("#bErr");
  const c = compute();
  if (c.err) { err.hidden = false; err.textContent = c.err; $("#tzline").className = "tzline warn"; $("#tzline").textContent = c.err; return; }
  err.hidden = true;
  CH = c; renderChart(c); renderDasha(c); renderNum(c); renderPlain(c); renderDaily(); persist();
  const act = (() => {
    const b = (1 - c.posIn) * YEARS[c.nk.lord]; let t = Date.UTC(c.Y, c.M - 1, c.D), i = LORDS.indexOf(c.nk.lord), n = Date.now();
    for (let k = 0; k < 10; k++) { const l = LORDS[(i + k) % 9], y = k === 0 ? b : YEARS[l], e = t + y * 365.2425 * 86400000; if (n >= t && n < e) return l; t = e; }
    return null;
  })();
  $("#strip").className = "strip on";
  $("#strip").innerHTML =
    (c.noTime ? "" : `<span class="chip"><span>Lagna</span><b>${SIGNS[c.ascSign][0]}</b></span>`) +
    `<span class="chip"><span>Rashi</span><b>${SIGNS[c.moonSign][0]}</b></span>
     <span class="chip"><span>Nakshatra</span><b>${c.nk.name} ${c.pada}</b></span>
     <span class="chip"><span>Sun</span><b>${SIGNS[c.sunSign][0]}</b></span>
     ${act ? `<span class="chip"><span>Dasha</span><b>${act}</b></span>` : ""}`;
  showTz();
  $("#bcard").open = false;
  $("#tools").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  toast("Chart ready");
}

const dToday = new Date();
const isoToday = dToday.getFullYear() + "-" + pad2(dToday.getMonth() + 1) + "-" + pad2(dToday.getDate());
$("#dDate").value = isoToday; $("#kDate").value = isoToday;
$("#bDate").max = isoToday;
if (!$("#bDate").value) $("#bDate").value = "1994-03-14";

$("#kGo").onclick = () => { if (CH) renderDaily(); else toast("Compute your chart first"); };
$("#kDate").onchange = () => { if (CH) renderDaily(); };
$("#dGo").onclick = calcDay;
$("#dDate").onchange = () => { calcDay(); if (CH) renderDaily(); };
$("#bGo").onclick = run;
$("#tNew").onclick = deal;
deal();

$("#dHere").onclick = () => {
  if (!navigator.geolocation) { toast("Location is not available"); return; }
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude: la, longitude: lo } = pos.coords;
    let best = null, bestD = 1e9;
    for (const p of PLACES) {
      const d = Math.hypot(p.la - la, p.lo - lo);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (best && bestD < 2) {
      CHOSEN.d = best; $("#dCity").value = best.label;
    } else {
      CHOSEN.d = { n: "Here", sub: la.toFixed(3) + ", " + lo.toFixed(3), la, lo, z: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", alt: "", label: "Current location" };
      $("#dCity").value = CHOSEN.d.label;
    }
    calcDay(); if (CH) renderDaily(); toast("Using your location for panchang");
  }, () => toast("Could not read location"), { enableHighAccuracy: false, timeout: 8000 });
};

(function boot() {
  const q = new URLSearchParams(location.search);
  try { applySaved(JSON.parse(localStorage.getItem(STORAGE) || "null")); } catch {}
  if (q.get("dob")) $("#bDate").value = q.get("dob");
  if (q.get("time")) { $("#bTime").value = q.get("time"); $("#bNoTime").checked = false; $("#bTime").disabled = false; }
  if (q.get("name")) $("#bName").value = q.get("name");
  if (q.get("place")) {
    const hit = PLACES.find((p) => p.label.toLowerCase() === q.get("place").toLowerCase()) || findPlaces(q.get("place"), 1)[0];
    if (hit) { CHOSEN.b = hit; $("#bCity").value = hit.label; }
  }
  if (!CHOSEN.b) {
    const b = PLACES.find((p) => p.n === "Bengaluru") || PLACES[0];
    if (b && !$("#bCity").value) { CHOSEN.b = b; $("#bCity").value = b.label; }
  }
  if (!CHOSEN.d) { CHOSEN.d = CHOSEN.b; if (CHOSEN.d) $("#dCity").value = CHOSEN.d.label; }
  showTz(); calcDay();
  const hash = (location.hash || "").replace("#", "");
  const tab = tabs.find((t) => t.dataset.hash === hash);
  if (tab) showTab(tab.getAttribute("aria-controls"), false);
  if (q.get("dob") && (CHOSEN.b || customPlace())) run();
})();

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
