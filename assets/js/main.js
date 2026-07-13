// BPM-THERAPY front-end interactions (no framework, no deps)

(function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.style.display === "flex";
      links.style.display = open ? "none" : "flex";
      links.style.flexDirection = "column";
      links.style.position = "absolute";
      links.style.top = "72px";
      links.style.left = "0";
      links.style.right = "0";
      links.style.background = "#08080b";
      links.style.padding = "20px 24px";
      links.style.borderBottom = "1px solid #232329";
    });
  }

  // Countdown to next scheduled stream day (Mon/Tue/Thu/Fri per schedule)
  var streamDays = [1, 2, 4, 5]; // Mon, Tue, Thu, Fri (0=Sun)
  var streamHour = 20; // 8pm local

  function nextStreamDate() {
    var now = new Date();
    for (var add = 0; add < 8; add++) {
      var d = new Date(now);
      d.setDate(now.getDate() + add);
      d.setHours(streamHour, 0, 0, 0);
      if (streamDays.indexOf(d.getDay()) !== -1 && d > now) return d;
    }
    return now;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    var target = nextStreamDate();
    var diff = Math.max(0, target - new Date());
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    var d = document.getElementById("cd-days");
    var h = document.getElementById("cd-hours");
    var m = document.getElementById("cd-mins");
    var s = document.getElementById("cd-secs");
    if (d) d.textContent = pad(days);
    if (h) h.textContent = pad(hours);
    if (m) m.textContent = pad(mins);
    if (s) s.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  // Demo inquiry form: shows in-page confirmation.
  // Swap this for a real form provider (Formspree/Netlify Forms) in production.
  var form = document.getElementById("inquiry-form");
  var confirm = document.getElementById("confirm");
  if (form && confirm) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      confirm.style.display = "block";
      form.reset();
    });
  }
})();
