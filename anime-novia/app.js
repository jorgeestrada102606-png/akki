// ============================================================
// app.js — AkkiNovia Streaming SPA
// Router de hash, rendering, lógica de player
// ============================================================

/* ---- Constantes ---- */
const BRAND          = 'AkkiNovia';
const FOLDER_S1      = '1EGJkFtaJz75GOPF-hxBwTPzVkLxHNqJ5';  // Carpeta Drive T1
const FOLDER_S1_URL  = `https://drive.google.com/drive/folders/${FOLDER_S1}`;

/* ---- State ---- */
const state = {
  view: 'home',
  activeSeason: 's1',
  player: { seasonId: null, epIndex: 0 },
};

/* ---- DOM Root ---- */
const root = document.getElementById('app');

/* ============================================================
   ROUTER
   #/            → home
   #/player/s1/0 → player
   #/setup/s1    → panel de configuración de temporada
   ============================================================ */
function route() {
  const hash = window.location.hash || '#/';

  if (hash.startsWith('#/player/')) {
    const [, , seasonId, idx] = hash.split('/');
    state.view = 'player';
    state.player.seasonId = seasonId || 's1';
    state.player.epIndex  = parseInt(idx ?? 0, 10);
    renderPlayerView();
  } else if (hash.startsWith('#/setup/')) {
    const seasonId = hash.replace('#/setup/', '');
    renderSetupView(seasonId);
  } else {
    state.view = 'home';
    renderHomeView();
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigate(hash) { window.location.hash = hash; }
window.addEventListener('hashchange', route);

/* ============================================================
   GOOGLE DRIVE UTILS
   ============================================================ */
function parseDriveId(url) {
  if (!url) return null;
  url = url.trim();
  if (/^[A-Za-z0-9_-]{20,}$/.test(url)) return url;
  const m1 = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

function driveEmbedUrl(id) {
  return `https://drive.google.com/file/d/${id}/preview`;
}

/* ============================================================
   PERSISTENCIA — localStorage
   ============================================================ */
const STORAGE_KEY = 'akkinovia_links';

function loadLinks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveLink(seasonId, epIndex, driveId) {
  const links = loadLinks();
  if (!links[seasonId]) links[seasonId] = {};
  links[seasonId][epIndex] = driveId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  SEASONS[seasonId].episodes[epIndex].driveId = driveId;
}

function hydrateLinks() {
  const links = loadLinks();
  for (const [seasonId, eps] of Object.entries(links)) {
    if (!SEASONS[seasonId]) continue;
    for (const [idx, driveId] of Object.entries(eps)) {
      const ep = SEASONS[seasonId].episodes[parseInt(idx, 10)];
      if (ep) ep.driveId = driveId;
    }
  }
}

function countLinks(seasonId) {
  const links = loadLinks();
  return links[seasonId] ? Object.keys(links[seasonId]).length : 0;
}

/* ============================================================
   PARTICLES
   ============================================================ */
function initParticles() {
  const wrap = document.getElementById('particles');
  if (!wrap) return;
  ['🌸','🌺','✿','❀','🌷'].forEach((sym, i) => {
    for (let j = 0; j < 3; j++) {
      const el = document.createElement('div');
      el.className = 'particle';
      el.textContent = sym;
      el.style.left = Math.random() * 100 + '%';
      el.style.fontSize = (Math.random() * 8 + 10) + 'px';
      el.style.animationDuration  = (Math.random() * 15 + 15) + 's';
      el.style.animationDelay     = (Math.random() * -25) + 's';
      wrap.appendChild(el);
    }
  });
}

/* ============================================================
   TOAST
   ============================================================ */
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icon = { success:'check_circle', error:'error', info:'info' }[type] ?? 'info';
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `<span class="ms">${icon}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.cssText += 'opacity:0;transform:translateX(20px);transition:0.3s ease;';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/* ============================================================
   NAVBAR
   ============================================================ */
function renderNavbar(view) {
  return `
    <nav class="navbar">
      <div class="container">
        <div class="navbar__inner">
          <a href="#/" class="logo">
            <div class="logo__mark">🌸</div>
            <span class="logo__text">Akki<em>Novia</em></span>
          </a>

          <div style="display:flex;align-items:center;gap:0.5rem;">
            ${view === 'player' ? `
              <span class="nav-pill">
                <span class="ms" style="font-size:0.9rem;">play_circle</span>
                Reproduciendo
              </span>
            ` : view === 'setup' ? `
              <span class="nav-pill nav-pill--active">
                <span class="ms" style="font-size:0.9rem;">settings</span>
                Configuración
              </span>
            ` : `
              <span class="nav-pill nav-pill--active">
                <span class="ms" style="font-size:0.9rem;">home</span>
                Inicio
              </span>
            `}
          </div>

          <div class="navbar__right">
            <div style="display:flex;align-items:center;gap:0.4rem;padding:0.3rem 0.75rem;border-radius:99px;border:1px solid var(--border);background:var(--surface-2);font-size:0.72rem;font-weight:600;color:var(--text-secondary);">
              <span style="width:7px;height:7px;border-radius:50%;background:#34d399;display:inline-block;"></span>
              Solo para ti 💖
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;
}

/* ============================================================
   HOME VIEW
   ============================================================ */
function renderHomeView() {
  const activeSeason = SEASONS[state.activeSeason];

  root.innerHTML = `
    ${renderNavbar('home')}

    <!-- Hero -->
    <section class="hero">
      <img class="hero__bg" src="${activeSeason.cover}" alt="" id="hero-bg-img" />
      <div class="hero__gradient"></div>
      <div class="hero__content">
        <div class="container">
          <div class="hero__eyebrow">
            <span>🌸 Solo para ti</span>
            <span class="hero__eyebrow-sep">·</span>
            <span>Kyoto Animation</span>
            <span class="hero__eyebrow-sep">·</span>
            <span style="color:#34d399;">Colección completa</span>
          </div>
          <h1 class="hero__title">Love, Chunibyo<br />&amp; Other Delusions</h1>
          <p class="hero__subtitle">中二病でも恋がしたい！</p>
          <div class="hero__meta">
            <span class="badge badge--pink">KyoAni</span>
            <span class="badge badge--green">2012 – 2018</span>
            <span class="badge badge--blue">3 entregas</span>
          </div>
          <div class="hero__actions">
            <button class="btn btn--primary" onclick="playFirst()">
              <span class="ms" style="font-variation-settings:'FILL' 1;">play_circle</span>
              Ver ahora
            </button>
            <button class="btn btn--ghost" onclick="document.getElementById('temporadas').scrollIntoView({behavior:'smooth'})">
              <span class="ms">video_library</span>
              Ver temporadas
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Season bar -->
    <div class="season-bar">
      <div class="container">
        <div class="season-bar__inner">
          ${Object.values(SEASONS).map(s => `
            <button
              class="season-tab ${s.id === state.activeSeason ? 'active' : ''}"
              onclick="selectSeason('${s.id}')"
            >
              ${s.id === 'movie' ? '🎬' : s.id === 's2' ? '💕' : '🌸'}
              ${s.title}
              <span class="season-tab__badge">${s.eps} ${s.id === 'movie' ? 'pel.' : 'eps'}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Main content -->
    <main style="position:relative;z-index:1;" id="temporadas">
      <div class="container" style="padding-top:2rem;">

        <!-- Season cards -->
        <div class="season-cards">
          ${Object.values(SEASONS).map(s => {
            const done = countLinks(s.id);
            return `
              <div class="season-card ${s.id === state.activeSeason ? 'active' : ''}" onclick="selectSeason('${s.id}')">
                <div class="season-card__img">
                  <img src="${s.cover}" alt="${s.title}" loading="lazy" />
                  <div class="season-card__overlay"></div>
                  <span class="season-card__year">${s.year}</span>
                </div>
                <div class="season-card__info">
                  <div class="season-card__tag">${s.id === 'movie' ? '🎬 Película' : s.title}</div>
                  <div class="season-card__name">${s.fullTitle}</div>
                  <div class="season-card__eps">
                    ${done > 0
                      ? `<span style="color:#34d399;font-weight:700;">▶ ${done}/${s.eps} disponibles</span>`
                      : `${s.eps === 1 ? '96 min' : `${s.eps} episodios`} · ${s.year}`}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Season banner -->
        <div class="season-banner" id="season-banner">
          ${renderSeasonBanner(activeSeason)}
        </div>

        <!-- Episode list -->
        <section class="ep-section">
          <div class="ep-section__header">
            <div class="ep-section__title">
              <span class="ms">format_list_bulleted</span>
              Episodios
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <span class="ep-section__count" id="ep-count">${activeSeason.eps} episodios</span>
              <button
                class="btn btn--ghost btn--sm"
                onclick="navigate('#/setup/${activeSeason.id}')"
                style="font-size:0.72rem;"
              >
                <span class="ms">link</span> Agregar links Drive
              </button>
            </div>
          </div>
          <div class="ep-grid" id="ep-grid">
            ${renderEpisodeGrid(activeSeason)}
          </div>
        </section>

      </div>
    </main>
  `;
}

function renderSeasonBanner(season) {
  const done = countLinks(season.id);
  return `
    <div class="season-banner__layout">
      <div class="season-banner__cover">
        <img src="${season.cover}" alt="${season.title}" />
      </div>
      <div class="season-banner__info">
        <div class="season-banner__label">${season.id === 'movie' ? '🎬 Película' : season.title}</div>
        <h2 class="season-banner__title">${season.fullTitle}</h2>
        <div class="season-banner__meta">
          <span class="badge badge--gray">${season.year}</span>
          <span class="badge badge--gray">${season.studio}</span>
          <span class="badge badge--gray">${season.eps === 1 ? '96 min' : `${season.eps} eps`}</span>
          ${done > 0
            ? `<span class="badge badge--green">▶ ${done}/${season.eps} listos</span>`
            : `<span class="badge badge--gray">Sin videos aún</span>`}
        </div>
        <p class="season-banner__desc">${season.description}</p>
        <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn--primary btn--sm" onclick="navigate('#/player/${season.id}/0')">
            <span class="ms" style="font-variation-settings:'FILL' 1;">play_arrow</span>
            Ver ep. 1
          </button>
          <button class="btn btn--ghost btn--sm" onclick="navigate('#/setup/${season.id}')">
            <span class="ms">link</span>
            Configurar links
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderEpisodeGrid(season) {
  return season.episodes.map((ep, idx) => {
    const hasVideo = !!ep.driveId;
    return `
      <div
        class="ep-row ${hasVideo ? '' : 'ep-row--no-video'}"
        onclick="navigate('#/player/${season.id}/${idx}')"
      >
        <span class="ep-num">${String(ep.n).padStart(2,'0')}</span>
        <div class="ep-thumb-mini">
          <img src="${season.cover}" alt="" loading="lazy" />
          <div class="play-hover"><span class="ms" style="font-variation-settings:'FILL' 1;color:var(--pink)">play_circle</span></div>
        </div>
        <div class="ep-body">
          <div class="ep-title">${ep.title}</div>
          <div class="ep-status ${hasVideo ? 'ep-status--ok' : ''}">
            ${hasVideo
              ? '<span class="ms" style="font-size:0.8rem">check_circle</span> Disponible'
              : '<span class="ms" style="font-size:0.8rem">radio_button_unchecked</span> Sin video'}
          </div>
        </div>
        <div class="ep-action">
          <span class="ms" style="font-size:0.9rem">${hasVideo ? 'play_arrow' : 'add_link'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectSeason(id) {
  state.activeSeason = id;
  const season = SEASONS[id];

  // Hero bg
  const img = document.getElementById('hero-bg-img');
  if (img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';
    setTimeout(() => { img.src = season.cover; img.style.opacity = '1'; }, 300);
  }

  // Tabs
  document.querySelectorAll('.season-tab').forEach((t, i) => {
    t.classList.toggle('active', Object.keys(SEASONS)[i] === id);
  });

  // Cards
  document.querySelectorAll('.season-card').forEach((c, i) => {
    c.classList.toggle('active', Object.keys(SEASONS)[i] === id);
  });

  // Banner
  const banner = document.getElementById('season-banner');
  if (banner) banner.innerHTML = renderSeasonBanner(season);

  // Episode grid
  const grid = document.getElementById('ep-grid');
  if (grid) {
    grid.style.cssText += 'opacity:0;transform:translateY(8px);transition:0.3s ease;';
    setTimeout(() => {
      grid.innerHTML = renderEpisodeGrid(season);
      grid.style.cssText += 'opacity:1;transform:translateY(0);';
    }, 180);
  }

  const count = document.getElementById('ep-count');
  if (count) count.textContent = `${season.eps} ${season.eps === 1 ? 'entrega' : 'episodios'}`;

  document.getElementById('temporadas')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

function playFirst() {
  navigate(`#/player/${state.activeSeason}/0`);
}

/* ============================================================
   SETUP VIEW — Panel para agregar links de Google Drive
   ============================================================ */
function renderSetupView(seasonId) {
  const season = SEASONS[seasonId];
  if (!season) { navigate('#/'); return; }

  const links    = loadLinks();
  const isS1     = seasonId === 's1';
  const folderUrl = isS1 ? FOLDER_S1_URL : null;

  root.innerHTML = `
    ${renderNavbar('setup')}

    <div style="position:relative;z-index:1;">
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;max-width:860px;">

        <!-- Back -->
        <button class="back-btn" onclick="history.back()" style="margin-bottom:1.5rem;">
          <span class="ms">arrow_back</span> Volver
        </button>

        <!-- Header -->
        <div style="margin-bottom:2rem;">
          <div style="font-size:0.72rem;font-weight:700;color:var(--pink);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.4rem;">
            Configuración de videos
          </div>
          <h1 style="font-size:1.8rem;font-weight:900;letter-spacing:-0.02em;margin-bottom:0.5rem;">
            ${season.title} — ${season.fullTitle}
          </h1>
          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.7;">
            Pega aquí el link de <strong style="color:white;">cada episodio individual</strong> de Google Drive.
            Los links se guardan en el navegador — no necesitas conexión para guardarlos.
          </p>
        </div>

        <!-- Instrucciones -->
        <div style="background:var(--surface-2);border:1px solid var(--border);border-left:3px solid var(--pink);border-radius:var(--radius-lg);padding:1.2rem 1.4rem;margin-bottom:2rem;">
          <div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;">
            <span class="ms" style="color:var(--pink);">info</span>
            Cómo obtener el link de cada video
          </div>
          <ol style="font-size:0.8rem;color:var(--text-secondary);line-height:1.9;padding-left:1.2rem;">
            <li>Abre tu carpeta de Google Drive 👇</li>
            <li>Haz <strong style="color:white;">clic derecho</strong> sobre el archivo de video del episodio</li>
            <li>Selecciona <strong style="color:white;">"Compartir" → "Copiar enlace"</strong></li>
            <li>Asegúrate de que diga <strong style="color:#34d399;">"Cualquiera con el enlace puede ver"</strong></li>
            <li>Pega el link en el campo del episodio correspondiente abajo</li>
          </ol>
          ${folderUrl ? `
            <div style="margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border);">
              <a
                href="${folderUrl}"
                target="_blank"
                rel="noopener"
                class="btn btn--primary btn--sm"
                style="display:inline-flex;"
              >
                <span class="ms">folder_open</span>
                Abrir carpeta de Drive (T1)
              </a>
              <span style="font-size:0.72rem;color:var(--text-muted);margin-left:0.75rem;">Se abre en una nueva pestaña</span>
            </div>
          ` : ''}
        </div>

        <!-- Episode inputs -->
        <div style="display:flex;flex-direction:column;gap:0.6rem;" id="setup-form">
          ${season.episodes.map((ep, idx) => {
            const saved = links[seasonId]?.[idx] || '';
            const hasLink = !!saved;
            return `
              <div style="
                display:grid;
                grid-template-columns:2.5rem 1fr auto;
                align-items:center;
                gap:0.75rem;
                padding:0.9rem 1rem;
                background:var(--surface-2);
                border:1px solid ${hasLink ? 'rgba(52,211,153,0.3)' : 'var(--border)'};
                border-radius:var(--radius);
                transition:border-color 0.2s;
              " id="row-${idx}">

                <span style="
                  font-size:1rem;font-weight:900;
                  font-family:'Zen Dots',monospace;
                  color:${hasLink ? '#34d399' : 'var(--text-muted)'};
                  text-align:right;
                ">${String(ep.n).padStart(2,'0')}</span>

                <div style="min-width:0;">
                  <div style="font-size:0.78rem;font-weight:600;color:var(--text-primary);margin-bottom:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${ep.title}
                  </div>
                  <input
                    class="link-input"
                    id="input-${idx}"
                    type="text"
                    placeholder="https://drive.google.com/file/d/..."
                    value="${saved ? `https://drive.google.com/file/d/${saved}/view` : ''}"
                    style="font-size:0.75rem;padding:0.4rem 0.75rem;width:100%;"
                    oninput="previewLink(${idx})"
                  />
                </div>

                <div style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;flex-shrink:0;">
                  <button
                    class="btn btn--primary btn--sm"
                    onclick="saveSingleLink('${seasonId}', ${idx})"
                    style="padding:0.35rem 0.6rem;font-size:0.7rem;"
                    title="Guardar"
                  >
                    <span class="ms">save</span>
                  </button>
                  ${hasLink ? `
                    <button
                      onclick="clearLink('${seasonId}', ${idx})"
                      style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.9rem;padding:0.1rem;"
                      title="Borrar"
                    >
                      <span class="ms">delete</span>
                    </button>
                  ` : ''}
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Save all -->
        <div style="margin-top:1.5rem;display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <button class="btn btn--primary" onclick="saveAllLinks('${seasonId}')">
            <span class="ms" style="font-variation-settings:'FILL' 1;">save</span>
            Guardar todos los links
          </button>
          <button class="btn btn--ghost" onclick="navigate('#/')">
            <span class="ms">home</span>
            Volver al inicio
          </button>
          <span style="font-size:0.75rem;color:var(--text-muted);" id="save-status"></span>
        </div>

      </div>
    </div>
  `;
}

function previewLink(idx) {
  const input = document.getElementById(`input-${idx}`);
  const row   = document.getElementById(`row-${idx}`);
  if (!input || !row) return;
  const id = parseDriveId(input.value);
  row.style.borderColor = input.value
    ? (id ? 'rgba(52,211,153,0.4)' : 'rgba(255,100,100,0.4)')
    : 'var(--border)';
}

function saveSingleLink(seasonId, idx) {
  const input = document.getElementById(`input-${idx}`);
  const url   = input?.value?.trim();
  if (!url) { clearLink(seasonId, idx); return; }
  const id = parseDriveId(url);
  if (!id) { toast('Link no válido — copia el link desde Drive', 'error'); return; }
  saveLink(seasonId, idx, id);
  const row = document.getElementById(`row-${idx}`);
  if (row) row.style.borderColor = 'rgba(52,211,153,0.4)';
  const num = row?.querySelector('span');
  if (num) num.style.color = '#34d399';
  toast(`Ep. ${idx + 1} guardado ✅`, 'success');
}

function clearLink(seasonId, idx) {
  const links = loadLinks();
  if (links[seasonId]) delete links[seasonId][idx];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  if (SEASONS[seasonId]?.episodes[idx]) SEASONS[seasonId].episodes[idx].driveId = null;
  const row = document.getElementById(`row-${idx}`);
  if (row) row.style.borderColor = 'var(--border)';
  const input = document.getElementById(`input-${idx}`);
  if (input) input.value = '';
  toast(`Ep. ${idx + 1} borrado`, 'info');
}

function saveAllLinks(seasonId) {
  const season = SEASONS[seasonId];
  let saved = 0, errors = 0;

  season.episodes.forEach((_, idx) => {
    const input = document.getElementById(`input-${idx}`);
    const url   = input?.value?.trim();
    if (!url) return;
    const id = parseDriveId(url);
    if (id) { saveLink(seasonId, idx, id); saved++; }
    else errors++;
  });

  const status = document.getElementById('save-status');
  if (status) status.textContent = `${saved} guardados${errors ? `, ${errors} con error` : ''}.`;
  if (saved > 0) toast(`¡${saved} episodios guardados! 🎉`, 'success');
  if (errors > 0) toast(`${errors} links no válidos`, 'error');
}

/* ============================================================
   PLAYER VIEW
   ============================================================ */
function renderPlayerView() {
  const { seasonId, epIndex } = state.player;
  const season = SEASONS[seasonId];
  if (!season) { navigate('#/'); return; }
  const ep = season.episodes[epIndex];
  if (!ep)     { navigate('#/'); return; }

  const hasVideo  = !!ep.driveId;
  const embedUrl  = hasVideo ? driveEmbedUrl(ep.driveId) : null;
  const prevIdx   = epIndex - 1;
  const nextIdx   = epIndex + 1;
  const hasPrev   = prevIdx >= 0;
  const hasNext   = nextIdx < season.episodes.length;

  root.innerHTML = `
    ${renderNavbar('player')}

    <div class="player-view">

      <!-- Back bar -->
      <div class="back-bar">
        <div class="container">
          <div class="back-bar__inner">
            <button class="back-btn" onclick="navigate('#/')">
              <span class="ms">arrow_back</span> Inicio
            </button>
            <div class="back-bar__meta">
              <span>${season.title}</span>
              <span>·</span>
              <span>Ep. ${ep.n} / ${season.eps}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Player layout -->
      <div class="player-layout">

        <!-- Main -->
        <div class="player-main">

          <!-- Video -->
          <div class="video-wrap">
            ${hasVideo ? `
              <iframe
                class="video-wrap__iframe visible"
                src="${embedUrl}"
                allow="autoplay; fullscreen"
                allowfullscreen
              ></iframe>
            ` : `
              <div class="video-placeholder">
                <div class="video-placeholder__icon">🎬</div>
                <div class="video-placeholder__title">Video no configurado</div>
                <p class="video-placeholder__sub">
                  Agrega el link de Google Drive para este episodio<br/>
                  desde el panel de configuración.
                </p>
                <button class="btn btn--primary btn--sm" onclick="navigate('#/setup/${seasonId}')">
                  <span class="ms">link</span> Agregar link de Drive
                </button>
              </div>
            `}
          </div>

          <!-- Episode info -->
          <div class="episode-info">
            <div class="episode-info__breadcrumb">
              <span>${season.id === 'movie' ? '🎬 Película' : season.title}</span>
              <span class="episode-info__breadcrumb-sep">·</span>
              <span>Episodio ${ep.n}</span>
            </div>
            <h1 class="episode-info__title">
              ${ep.title}
              <span class="badge badge--green">${season.year}</span>
            </h1>
            <div class="episode-info__sub">
              ${season.fullTitle} · ${season.studio} · Audio japonés original
            </div>
            <div class="episode-info__actions">
              <button class="btn btn--ghost btn--sm" onclick="toast('Guardado 💖','success')">
                <span class="ms">bookmark</span> Guardar
              </button>
              <button class="btn btn--ghost btn--sm" onclick="navigate('#/setup/${seasonId}')">
                <span class="ms">edit_link</span>
                ${hasVideo ? 'Cambiar link' : 'Agregar link Drive'}
              </button>
            </div>
          </div>

          <!-- Prev / Next -->
          <div class="ep-nav">
            <button class="ep-nav__btn" ${!hasPrev ? 'disabled' : ''} onclick="navigate('#/player/${seasonId}/${prevIdx}')">
              <span class="ms">skip_previous</span> Anterior
            </button>
            <span class="ep-nav__spacer"></span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${ep.n} / ${season.eps}</span>
            <span class="ep-nav__spacer"></span>
            <button class="ep-nav__btn" ${!hasNext ? 'disabled' : ''} onclick="navigate('#/player/${seasonId}/${nextIdx}')">
              Siguiente <span class="ms">skip_next</span>
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="player-sidebar">
          <div class="sidebar-header">
            <div class="sidebar-header__title">
              <span class="ms">video_library</span>
              ${season.title} · Episodios
            </div>
            <button
              class="btn btn--ghost btn--sm"
              onclick="navigate('#/setup/${seasonId}')"
              style="font-size:0.68rem;padding:0.25rem 0.5rem;"
            >
              <span class="ms">link</span> Links
            </button>
          </div>

          <div class="sidebar-ep-list">
            ${season.episodes.map((e, i) => `
              <div
                class="sidebar-ep ${i === epIndex ? 'active' : ''}"
                onclick="navigate('#/player/${seasonId}/${i}')"
              >
                <span class="sidebar-ep__num">${String(e.n).padStart(2,'0')}</span>
                <div class="sidebar-ep__thumb">
                  <img src="${season.cover}" alt="" loading="lazy" />
                </div>
                <div class="sidebar-ep__info">
                  <div class="sidebar-ep__title">${e.title}</div>
                  <div class="sidebar-ep__status">
                    ${e.driveId
                      ? '<span class="ms" style="font-size:0.75rem;color:#34d399">check_circle</span> Disponible'
                      : '<span class="ms" style="font-size:0.75rem;color:var(--text-muted)">radio_button_unchecked</span> Sin video'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </aside>

      </div>
    </div>
  `;
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  hydrateLinks();
  initParticles();

  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 400);
    }, 700);
  }

  route();
});
