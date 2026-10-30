/* ============================================================
   AuraQuest Lab — 埋点 + Cookie 同意门控
   用法：
     1. 把下面 CLARITY_ID 换成你的项目 ID（Clarity 后台 → Settings → Overview）
     2. 这个文件放在仓库根目录
     3. 在 index.html 和 quiz.html 的 </head> 前各加一行：
        <script src="/analytics.js"></script>
   ============================================================ */

(function () {
  var CLARITY_ID = "z5llbgxnqz";   // ← 改这一行

  /* ---------- 加载 Clarity ---------- */
  function loadClarity() {
    if (window.__clarityLoaded) return;
    window.__clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  /* ---------- 打点辅助（Clarity 未就绪时先排队） ---------- */
  var pending = [];
  function setTag(k, v) {
    if (window.clarity) {
      try { clarity("set", k, String(v)); } catch (e) {}
    } else {
      pending.push([k, v]);
    }
  }
  function flushTags() {
    for (var i = 0; i < pending.length; i++) {
      try { clarity("set", pending[i][0], String(pending[i][1])); } catch (e) {}
    }
    pending = [];
  }

  window.track = function (name, props) {
    try {
      if (window.clarity) clarity("event", name);
      if (props) for (var k in props) setTag(k, props[k]);
    } catch (e) {}
  };

  /* ---------- 记录来源参数 ?src=tt001 ---------- */
  var src = "direct";
  try {
    var p = new URLSearchParams(location.search).get("src");
    if (p) localStorage.setItem("aq_src", p);
    src = localStorage.getItem("aq_src") || "direct";
  } catch (e) {}
  setTag("src", src);
  setTag("page", location.pathname);

  /* ---------- 已同意就直接加载 ---------- */
  var consent = null;
  try { consent = localStorage.getItem("aq_consent"); } catch (e) {}
  if (consent === "1") { loadClarity(); flushTags(); return; }

  /* ---------- 同意条 ---------- */
  function showBanner() {
    if (document.getElementById("aq-consent")) return;

    var bar = document.createElement("div");
    bar.id = "aq-consent";
    bar.innerHTML =
      '<span style="flex:1;min-width:200px">We use analytics cookies to improve this site. ' +
      '<a href="/privacy.html" style="color:#93c5fd;text-decoration:underline">Details</a></span>' +
      '<span style="display:flex;gap:8px">' +
      '<button id="aq-yes" type="button">Accept</button>' +
      '<button id="aq-no" type="button">Decline</button>' +
      '</span>';

    bar.style.cssText =
      "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;display:flex;gap:12px;" +
      "align-items:center;justify-content:space-between;flex-wrap:wrap;" +
      "background:#111827;color:#fff;padding:14px 16px;border-radius:14px;" +
      "font:14px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;" +
      "box-shadow:0 10px 40px rgba(0,0,0,.3)";

    document.body.appendChild(bar);

    function styleBtn(b, primary) {
      b.style.cssText =
        "border:0;border-radius:999px;padding:9px 18px;font-size:14px;cursor:pointer;" +
        (primary ? "background:#fff;color:#111827;font-weight:600" : "background:transparent;color:#d1d5db");
    }

    var yes = document.getElementById("aq-yes");
    var no = document.getElementById("aq-no");
    styleBtn(yes, true);
    styleBtn(no, false);

    yes.onclick = function () {
      try { localStorage.setItem("aq_consent", "1"); } catch (e) {}
      loadClarity();
      flushTags();
      bar.remove();
    };

    no.onclick = function () {
      try { localStorage.setItem("aq_consent", "0"); } catch (e) {}
      bar.remove();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showBanner);
  } else {
    showBanner();
  }
})();
