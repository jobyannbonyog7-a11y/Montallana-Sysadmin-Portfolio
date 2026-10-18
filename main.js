/* =========================================================
   main.js – lahat ng interaction ng website
   1. Theme (dark/light)   2. Language (EN/TL)   3. Navbar
   4. Typing effect        5. Embers (fire particles)
   6. Scroll reveal + skill bars + counters + 3D tilt
   7. Code playground (simulated terminal)
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return localStorage.getItem(k) || d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. THEME ---------- */
  const themeBtn = $("#themeBtn");
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    themeBtn.innerHTML = t === "dark" ? "&#9790;" : "&#9728;"; // moon / sun
    themeBtn.title = t === "dark" ? "Switch to light mode" : "Switch to dark mode";
    store.set("theme", t);
  }
  setTheme(store.get("theme", "dark"));
  themeBtn.addEventListener("click", () =>
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  /* ---------- 2. LANGUAGE ---------- */
  const langBtn = $("#langBtn");
  let lang = store.get("lang", "en");
  function applyLang() {
    const dict = TRANSLATIONS[lang];
    document.documentElement.lang = lang === "tl" ? "fil" : "en";
    $$("[data-i18n]").forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });
    langBtn.textContent = lang === "en" ? "EN" : "TL";
    store.set("lang", lang);
    restartTyping();
  }
  langBtn.addEventListener("click", () => { lang = lang === "en" ? "tl" : "en"; applyLang(); });

  /* ---------- 3. NAVBAR ---------- */
  const hamburger = $("#hamburger"), navLinks = $("#navLinks");
  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
  });
  $$("a", navLinks).forEach(a => a.addEventListener("click", () => {
    navLinks.classList.remove("open"); hamburger.classList.remove("open"); hamburger.setAttribute("aria-expanded", false);
  }));
  // active link on scroll
  const sections = $$("main section[id]");
  const linkFor = id => $(`.nav-links a[href="#${id}"]`);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$(".nav-links a").forEach(a => a.classList.remove("active"));
        const l = linkFor(e.target.id); if (l) l.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));
  // back-to-top
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 600), { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- 4. TYPING EFFECT ---------- */
  const typedEl = $("#typed");
  let typeTimer, tIdx = 0, cIdx = 0, deleting = false;
  function tick() {
    const words = TRANSLATIONS[lang].typed;
    const word = words[tIdx % words.length];
    if (reduceMotion) { typedEl.textContent = word; return; }
    typedEl.textContent = word.slice(0, cIdx);
    if (!deleting && cIdx < word.length) { cIdx++; typeTimer = setTimeout(tick, 70); }
    else if (!deleting) { deleting = true; typeTimer = setTimeout(tick, 1400); }
    else if (cIdx > 0) { cIdx--; typeTimer = setTimeout(tick, 35); }
    else { deleting = false; tIdx++; typeTimer = setTimeout(tick, 300); }
  }
  function restartTyping() { clearTimeout(typeTimer); tIdx = 0; cIdx = 0; deleting = false; tick(); }

  /* ---------- 5. EMBERS (fire particles) ---------- */
  const canvas = $("#embers"), ctx = canvas.getContext("2d");
  let W, H, embers = [];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  addEventListener("resize", resize); resize();
  const colors = ["255,61,129", "255,138,31", "255,210,77", "72,180,255"];
  function spawn() {
    return { x: Math.random() * W, y: H + 10, r: Math.random() * 2.4 + .6, vy: Math.random() * 1 + .4,
      vx: (Math.random() - .5) * .6, life: 1, c: colors[(Math.random() * colors.length) | 0], w: Math.random() * Math.PI * 2 };
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    if (embers.length < (W < 700 ? 35 : 70) && Math.random() < .5) embers.push(spawn());
    embers = embers.filter(p => p.life > 0 && p.y > -10);
    for (const p of embers) {
      p.w += .03; p.x += p.vx + Math.sin(p.w) * .4; p.y -= p.vy; p.life -= .0035;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c},${Math.max(p.life, 0) * .85})`;
      ctx.shadowColor = `rgba(${p.c},1)`; ctx.shadowBlur = 12;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  if (!reduceMotion) loop();

  /* ---------- 6. REVEAL, SKILL BARS, COUNTERS, TILT ---------- */
  $$(".section-title, .section-sub, .card, .skill-col, .terminal, .about-card").forEach(el => el.classList.add("reveal"));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$(".bar", e.target).forEach(b => b.classList.add("go"));
      revealObs.unobserve(e.target);
    });
  }, { threshold: .15 });
  $$(".reveal").forEach(el => revealObs.observe(el));

  // counters in hero
  $$("[data-count]").forEach(el => {
    const end = +el.dataset.count; let n = 0;
    const step = () => { n++; el.textContent = n + "+"; if (n < end) setTimeout(step, 110); };
    setTimeout(step, 600);
  });

  // 3D tilt on cards (desktop only)
  if (matchMedia("(hover: hover)").matches && !reduceMotion) {
    $$(".tilt").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `translateY(-8px) perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- 7. CODE PLAYGROUND (simulated) ---------- */
  const SNIPPETS = {
    bash: `# Check the health of a Linux server
whoami
uptime
df -h
free -m
systemctl status ssh`,
    powershell: `# Windows administration with PowerShell
Get-Service | Where-Object {$_.Status -eq 'Running'}
Get-LocalUser
Get-Process | Sort-Object CPU -Descending | Select -First 3`,
    ssh: `# Connect to a remote server and manage users
ssh admin@192.168.1.10
sudo apt update && sudo apt upgrade -y
sudo useradd -m juan
sudo passwd juan
ping -c 3 192.168.1.1`,
    backup: `# Simple backup and verify
tar -czf backup.tar.gz /var/www
ls -lh backup.tar.gz
rsync -av /var/www /mnt/backup`
  };
  // pattern -> canned output
  const FAKE = [
    [/^whoami/, "sysadmin"],
    [/^uptime/, " 09:15:02 up 42 days,  3:11,  2 users,  load average: 0.12, 0.08, 0.05"],
    [/^df -h/, "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  38% /\n/dev/sdb1       200G   72G  118G  38% /var/www"],
    [/^free -m/, "              total   used   free  shared  buff/cache  available\nMem:           7954   2310   3120     112        2523       5301\nSwap:          2047      0   2047"],
    [/^systemctl status/, "● ssh.service - OpenBSD Secure Shell server\n   Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n   Active: active (running) since Mon 2026-08-31 06:04:11 PST; 6 weeks ago"],
    [/^Get-Service/, "Status   Name               DisplayName\n------   ----               -----------\nRunning  Dhcp               DHCP Client\nRunning  Dnscache           DNS Client\nRunning  EventLog           Windows Event Log\nRunning  W32Time            Windows Time"],
    [/^Get-LocalUser/, "Name           Enabled Description\n----           ------- -----------\nAdministrator  True    Built-in account for administering the computer\nGuest          False   Built-in account for guest access\nmaria          True    Staff account"],
    [/^Get-Process/, "Handles  CPU(s)   Id ProcessName\n-------  ------   -- -----------\n   1520  312.40 4120 chrome\n    980  120.15 2288 sqlservr\n    412   45.72  880 svchost"],
    [/^ssh /, "Connecting to 192.168.1.10 ...\nThe authenticity of host was verified.\nWelcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)"],
    [/^sudo apt update/, "Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nReading package lists... Done\n0 packages can be upgraded. System is up to date."],
    [/^sudo useradd/, "(user created)"],
    [/^sudo passwd/, "New password: ********\npasswd: password updated successfully"],
    [/^ping/, "PING 192.168.1.1: 56 data bytes\n64 bytes from 192.168.1.1: time=1.2 ms\n64 bytes from 192.168.1.1: time=0.9 ms\n64 bytes from 192.168.1.1: time=1.1 ms\n--- 0% packet loss ---"],
    [/^tar /, "(archive created: backup.tar.gz)"],
    [/^ls -lh/, "-rw-r--r-- 1 sysadmin sysadmin 148M Oct 17 09:20 backup.tar.gz"],
    [/^rsync/, "sending incremental file list\nwww/index.html\nwww/css/style.css\n\nsent 1,204 bytes  received 38 bytes\ntotal size is 148,201,330  speedup is 119,324.17"]
  ];
  const codeInput = $("#codeInput"), output = $("#output"), runBtn = $("#runBtn");
  let running = false;
  function loadSnippet(name) {
    codeInput.value = SNIPPETS[name];
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.snip === name));
    output.textContent = "";
  }
  $$(".tab").forEach(t => t.addEventListener("click", () => loadSnippet(t.dataset.snip)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  async function run() {
    if (running) return;
    running = true; runBtn.disabled = true; output.innerHTML = "";
    const lines = codeInput.value.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    for (const line of lines) {
      output.innerHTML += `<span class="cmd">$ ${esc(line)}</span>\n`;
      await sleep(reduceMotion ? 0 : 450);
      const hit = FAKE.find(([re]) => re.test(line));
      output.innerHTML += hit
        ? esc(hit[1]) + "\n\n"
        : `<span class="err">${esc(line.split(" ")[0])}: ${TRANSLATIONS[lang].unknown}</span>\n\n`;
      output.scrollTop = output.scrollHeight;
    }
    output.innerHTML += TRANSLATIONS[lang].ran;
    running = false; runBtn.disabled = false;
  }
  runBtn.addEventListener("click", run);
  $("#clearBtn").addEventListener("click", () => { output.textContent = ""; });
  codeInput.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });

  /* ---------- INIT ---------- */
  loadSnippet("bash");
  applyLang();
})();
