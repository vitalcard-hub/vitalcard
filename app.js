// app.js
const STORE_KEY = 'vitalcard_profile_v1';
const LANG_KEY = 'vitalcard_lang_v1';
const PIN_KEY = 'vitalcard_edit_pin_v1';
let editUnlockedThisSession = false;

function getPin(){ return localStorage.getItem(PIN_KEY) || ''; }
function setPin(p){ localStorage.setItem(PIN_KEY, p); }
function removePin(){ localStorage.removeItem(PIN_KEY); editUnlockedThisSession = true; }

const DEFAULT_PROFILE = {
  name: '', dob: '', sex: '', bloodType: '?',
  emergencyContact: { name:'', phone:'', relation:'' },
  allergies: [],       // {id, key|null, custom, severity}
  conditions: [],       // {id, key|null, custom}
  birthConditions: [],  // {id, key|null, custom}
  medications: [],       // {id, name, dose, freq}
  surgeries: [],          // {id, name, year}
  organDonor: false,
  notes: ''
};

function loadProfile(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return structuredClone(DEFAULT_PROFILE);
    return { ...structuredClone(DEFAULT_PROFILE), ...JSON.parse(raw) };
  }catch(e){ return structuredClone(DEFAULT_PROFILE); }
}
function saveProfile(p){
  localStorage.setItem(STORE_KEY, JSON.stringify(p));
}
function uid(){ return Math.random().toString(36).slice(2,9); }

let profile = loadProfile();
let lang = localStorage.getItem(LANG_KEY) || (navigator.language || 'es').slice(0,2);
if(!LANGS.find(l=>l.code===lang)) lang = 'es';

function ui(key){ return t(UI, key, lang); }

/* ---------------- Rendering: Emergency Card ---------------- */
function renderApp(){
  document.getElementById('lang-pill-label').textContent = lang.toUpperCase();
  renderCardScreen();
  renderEditScreen();
}

function chipHTML(dict, item, tone){
  const label = item.key ? t(dict, item.key, lang) : item.custom;
  const icon = item.key && dict[item.key] ? dict[item.key].icon : '•';
  const sevClass = item.severity === 'severe' ? ' sev-severe' : '';
  const sevBadge = item.severity ? `<span class="sev">${ui(item.severity)}</span>` : '';
  return `<span class="chip ${tone}${sevClass}"><span class="icon">${icon}</span>${escapeHTML(label)}${sevBadge}</span>`;
}

function escapeHTML(s){
  return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderCardScreen(){
  const el = document.getElementById('screen-card');
  const hasAllergies = profile.allergies.length > 0;

  el.innerHTML = `
    <div class="emergency-card">
      <div class="band"><span><span class="dot"></span>${ui('emergencyCard')}</span><span>${lang.toUpperCase()}/EN</span></div>
      <div class="id-block">
        <div style="flex:1">
          <div class="name">${escapeHTML(profile.name) || '—'}</div>
          <div class="meta">${profile.dob ? profile.dob : '—'} · ${escapeHTML(profile.sex)||'—'}</div>
        </div>
        <div class="blood-tile">
          <div class="bt-label">${ui('bloodType')}</div>
          <div class="bt-value">${profile.bloodType}</div>
        </div>
      </div>

      <div class="perforation"></div>

      <div class="card-section">
        <div class="sec-label">🚨 ${ui('allergies')}</div>
        ${hasAllergies
          ? `<div class="chip-row">${profile.allergies.map(a=>chipHTML(ALLERGY_DICT,a,'alert')).join('')}</div>`
          : `<span class="chip safe"><span class="icon">✓</span>${ui('noAllergies')}</span>`}
      </div>

      <div class="card-section">
        <div class="sec-label">🩺 ${ui('conditions')}</div>
        ${profile.conditions.length
          ? `<div class="chip-row">${profile.conditions.map(c=>chipHTML(CONDITION_DICT,c,'info')).join('')}</div>`
          : `<span class="empty-note">—</span>`}
      </div>

      <div class="card-section">
        <div class="sec-label">🧬 ${ui('birthConditions')}</div>
        ${profile.birthConditions.length
          ? `<div class="chip-row">${profile.birthConditions.map(c=>chipHTML(BIRTH_CONDITION_DICT,c,'info')).join('')}</div>`
          : `<span class="empty-note">—</span>`}
      </div>

      <div class="card-section">
        <div class="sec-label">💊 ${ui('medications')}</div>
        ${profile.medications.length
          ? `<div class="chip-row">${profile.medications.map(m=>`<span class="chip info"><span class="icon">💊</span>${escapeHTML(m.name)}${m.dose?` · ${escapeHTML(m.dose)}`:''}</span>`).join('')}</div>`
          : `<span class="empty-note">—</span>`}
      </div>

      <div class="card-section">
        <div class="sec-label">📞 ${ui('emergencyContact')}</div>
        ${profile.emergencyContact.name
          ? `<div>${escapeHTML(profile.emergencyContact.name)} (${escapeHTML(profile.emergencyContact.relation)}) — <a href="tel:${escapeHTML(profile.emergencyContact.phone)}">${escapeHTML(profile.emergencyContact.phone)}</a></div>`
          : `<span class="empty-note">—</span>`}
      </div>

      ${profile.notes ? `<div class="card-section"><div class="sec-label">📝 ${ui('notes')}</div><div>${escapeHTML(profile.notes)}</div></div>` : ''}
    </div>

    <div class="privacy-note">🔒 <span>${ui('dataOnDevice')}</span></div>

    <div class="action-row">
      <button class="btn alert" id="btn-doctor-mode">🩺 ${ui('doctorMode')}</button>
    </div>
    <div class="action-row">
      <button class="btn primary" id="btn-show-qr">▦ ${ui('showQR')}</button>
    </div>
  `;

  document.getElementById('btn-doctor-mode').onclick = openDoctorMode;
  document.getElementById('btn-show-qr').onclick = openQRModal;
}

/* ---------------- Doctor mode (full screen, language-agnostic) ---------------- */
function openDoctorMode(){
  const wrap = document.getElementById('doctor-mode');

  function multiLang(dict, key, custom){
    return LANGS.map(l => {
      const label = key ? t(dict, key, l.code) : custom;
      return `<div class="lang-line"><span class="lang-code">${l.code.toUpperCase()}</span>${escapeHTML(label)}</div>`;
    }).join('');
  }

  const allergiesHTML = profile.allergies.length ? profile.allergies.map(a => `
      <div class="dm-chip-big"><span class="icon">${a.key && ALLERGY_DICT[a.key] ? ALLERGY_DICT[a.key].icon : '•'}</span>
        <div>
          <div>${escapeHTML(a.key ? t(ALLERGY_DICT,a.key,'en') : a.custom)} ${a.severity ? `— <b>${t(UI,a.severity,'en').toUpperCase()}</b>`:''}</div>
          <div class="multi-lang-block">${multiLang(ALLERGY_DICT, a.key, a.custom)}</div>
        </div>
      </div>`).join('')
    : `<div class="dm-chip-big" style="background:var(--safe-bg);color:var(--safe)">✓ ${t(UI,'noAllergies','en')}</div>`;

  const allConds = profile.conditions.concat(profile.birthConditions);
  const conditionsHTML = allConds.length
    ? allConds.map(c => {
        const dict = profile.conditions.includes(c) ? CONDITION_DICT : BIRTH_CONDITION_DICT;
        return `<div class="dm-chip-big"><span class="icon">${c.key && dict[c.key] ? dict[c.key].icon : '•'}</span>
          <div><div>${escapeHTML(c.key ? t(dict,c.key,'en') : c.custom)}</div></div></div>`;
      }).join('')
    : `<div class="empty-note">—</div>`;

  const medsHTML = profile.medications.length
    ? profile.medications.map(m => `<div class="dm-chip-big"><span class="icon">💊</span><div>${escapeHTML(m.name)} ${m.dose?`— ${escapeHTML(m.dose)}`:''} ${m.freq?`(${escapeHTML(m.freq)})`:''}</div></div>`).join('')
    : `<div class="empty-note">—</div>`;

  wrap.innerHTML = `
    <div class="dm-header">🚨 ${t(UI,'emergencyCard','en')} / ${ui('emergencyCard')}<button class="dm-close" id="dm-close">✕</button></div>
    <div class="dm-blood">
      <div class="dm-bt">${profile.bloodType}</div>
      <div class="dm-bt-label">${t(UI,'bloodType','en')} / ${ui('bloodType')}</div>
      <div style="font-family:var(--display);font-size:18px;margin-top:6px;">${escapeHTML(profile.name)} · ${profile.dob||'—'}</div>
    </div>
    <div class="dm-section alert-section">
      <div class="dm-label">🚨 ${t(UI,'allergies','en')} / ${ui('allergies')}</div>
      ${allergiesHTML}
    </div>
    <div class="dm-section">
      <div class="dm-label">🩺 ${t(UI,'conditions','en')} / ${ui('conditions')}</div>
      ${conditionsHTML}
    </div>
    <div class="dm-section">
      <div class="dm-label">💊 ${t(UI,'medications','en')} / ${ui('medications')}</div>
      ${medsHTML}
    </div>
    <div class="dm-section">
      <div class="dm-label">📞 ${t(UI,'emergencyContact','en')} / ${ui('emergencyContact')}</div>
      ${profile.emergencyContact.name ? `<div class="dm-chip-big"><div>${escapeHTML(profile.emergencyContact.name)} (${escapeHTML(profile.emergencyContact.relation)})<br><a href="tel:${escapeHTML(profile.emergencyContact.phone)}">${escapeHTML(profile.emergencyContact.phone)}</a></div></div>` : `<div class="empty-note">—</div>`}
    </div>
    ${profile.notes ? `<div class="dm-section"><div class="dm-label">📝 ${t(UI,'notes','en')} / ${ui('notes')}</div><div>${escapeHTML(profile.notes)}</div></div>` : ''}
  `;
  wrap.style.display = 'block';
  document.getElementById('dm-close').onclick = () => { wrap.style.display = 'none'; };
}

/* ---------------- QR ---------------- */
function buildQRPayload(){
  const lines = [];
  lines.push(`HEALTH ID / ${ui('emergencyCard')}`);
  lines.push(`${profile.name || '?'} | DOB:${profile.dob||'?'} | ${t(UI,'bloodType','en')}:${profile.bloodType}`);
  lines.push(`ALLERGIES: ${profile.allergies.length ? profile.allergies.map(a=>(a.key?t(ALLERGY_DICT,a.key,'en'):a.custom)+(a.severity?`(${a.severity})`:'')).join(', ') : 'NONE KNOWN'}`);
  if(profile.conditions.length) lines.push(`CONDITIONS: ${profile.conditions.map(c=>c.key?t(CONDITION_DICT,c.key,'en'):c.custom).join(', ')}`);
  if(profile.birthConditions.length) lines.push(`CONGENITAL: ${profile.birthConditions.map(c=>c.key?t(BIRTH_CONDITION_DICT,c.key,'en'):c.custom).join(', ')}`);
  if(profile.medications.length) lines.push(`MEDS: ${profile.medications.map(m=>`${m.name}${m.dose?' '+m.dose:''}`).join(', ')}`);
  if(profile.emergencyContact.name) lines.push(`EMERGENCY CONTACT: ${profile.emergencyContact.name} ${profile.emergencyContact.phone}`);
  return lines.join('\n');
}

function openQRModal(){
  const backdrop = document.getElementById('qr-modal');
  backdrop.classList.remove('hidden');
  const wrap = document.getElementById('qr-canvas-wrap');
  wrap.innerHTML = '';
  const payload = buildQRPayload();
  if(payload.length > 900){
    wrap.innerHTML = `<p style="color:var(--alert)">${escapeHTML('Demasiados datos para un solo QR. Reduce notas o medicamentos.')}</p>`;
  } else {
    new QRCode(wrap, { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
  }
}

/* ---------------- Edit screen ---------------- */
function fieldRowsFor(list, dict, extra){
  if(!list.length) return `<div class="empty-note">—</div>`;
  return list.map(item => {
    const label = item.key ? t(dict, item.key, lang) : (item.custom !== undefined ? item.custom : item.name);
    return `<div class="item-row">
      <div class="item-main">${escapeHTML(label)}${extra ? extra(item) : ''}</div>
      <button class="icon-btn del" data-del="${item.id}">✕</button>
    </div>`;
  }).join('');
}

function optionsFor(dict){
  return `<option value="">${lang==='es'?'— elegir de la lista —':'— pick from list —'}</option>` +
    Object.keys(dict).map(k => `<option value="${k}">${dict[k].icon} ${t(dict,k,lang)}</option>`).join('');
}

function renderEditScreen(){
  const el = document.getElementById('screen-edit');
  el.innerHTML = `
    <div class="form-section">
      <h3>${lang==='es'?'Identidad':'Identity'}</h3>
      <div class="field"><label>${lang==='es'?'Nombre completo':'Full name'}</label>
        <input type="text" id="f-name" value="${escapeHTML(profile.name)}"></div>
      <div class="two-col">
        <div class="field"><label>${lang==='es'?'Nacimiento':'Date of birth'}</label>
          <input type="date" id="f-dob" value="${profile.dob}"></div>
        <div class="field"><label>${lang==='es'?'Sexo':'Sex'}</label>
          <select id="f-sex">
            <option value="">—</option>
            <option ${profile.sex==='F'?'selected':''}>F</option>
            <option ${profile.sex==='M'?'selected':''}>M</option>
            <option ${profile.sex==='X'?'selected':''}>X</option>
          </select></div>
      </div>
      <div class="field"><label>${ui('bloodType')}</label>
        <select id="f-blood">${BLOOD_TYPES.map(b=>`<option ${profile.bloodType===b?'selected':''}>${b}</option>`).join('')}</select></div>
    </div>

    <div class="form-section">
      <h3>🚨 ${ui('allergies')}</h3>
      <div id="list-allergies">${fieldRowsFor(profile.allergies, ALLERGY_DICT, a=>a.severity?` <small>${ui(a.severity)}</small>`:'')}</div>
      <div class="add-row" style="margin-top:8px;">
        <select id="new-allergy-select">${optionsFor(ALLERGY_DICT)}</select>
      </div>
      <div class="severity-select" id="sev-select">
        <div class="sev-opt mild" data-sev="mild">${ui('mild')}</div>
        <div class="sev-opt moderate" data-sev="moderate">${ui('moderate')}</div>
        <div class="sev-opt severe" data-sev="severe">${ui('severe')}</div>
      </div>
      <div class="add-row" style="margin-top:8px;">
        <input type="text" id="new-allergy-custom" placeholder="${lang==='es'?'...o escribe una que no esté en la lista':'...or type one not on the list'}">
        <button class="btn primary" id="add-allergy">+ ${lang==='es'?'Añadir':'Add'}</button>
      </div>
    </div>

    <div class="form-section">
      <h3>🩺 ${ui('conditions')}</h3>
      <div id="list-conditions">${fieldRowsFor(profile.conditions, CONDITION_DICT)}</div>
      <div class="add-row" style="margin-top:8px;">
        <select id="new-cond-select">${optionsFor(CONDITION_DICT)}</select>
      </div>
      <div class="add-row" style="margin-top:8px;">
        <input type="text" id="new-cond-custom" placeholder="${lang==='es'?'...o escribe otra':'...or type another'}">
        <button class="btn primary" id="add-cond">+ ${lang==='es'?'Añadir':'Add'}</button>
      </div>
    </div>

    <div class="form-section">
      <h3>🧬 ${ui('birthConditions')}</h3>
      <div id="list-birth">${fieldRowsFor(profile.birthConditions, BIRTH_CONDITION_DICT)}</div>
      <div class="add-row" style="margin-top:8px;">
        <select id="new-birth-select">${optionsFor(BIRTH_CONDITION_DICT)}</select>
      </div>
      <div class="add-row" style="margin-top:8px;">
        <input type="text" id="new-birth-custom" placeholder="${lang==='es'?'...o escribe otra':'...or type another'}">
        <button class="btn primary" id="add-birth">+ ${lang==='es'?'Añadir':'Add'}</button>
      </div>
    </div>

    <div class="form-section">
      <h3>💊 ${ui('medications')}</h3>
      <div id="list-meds">${fieldRowsFor(profile.medications, {}, m=>` <small>${escapeHTML(m.dose||'')} ${escapeHTML(m.freq||'')}</small>`)}</div>
      <div class="two-col">
        <div class="field"><input type="text" id="new-med-name" placeholder="${lang==='es'?'Nombre':'Name'}"></div>
        <div class="field"><input type="text" id="new-med-dose" placeholder="${lang==='es'?'Dosis':'Dose'}"></div>
      </div>
      <button class="btn primary" id="add-med">+ ${lang==='es'?'Añadir medicamento':'Add medication'}</button>
    </div>

    <div class="form-section">
      <h3>✂️ ${ui('surgeries')}</h3>
      <div id="list-surg">${fieldRowsFor(profile.surgeries, {}, s=>` <small>${escapeHTML(s.year||'')}</small>`)}</div>
      <div class="two-col">
        <div class="field"><input type="text" id="new-surg-name" placeholder="${lang==='es'?'Cirugía':'Surgery'}"></div>
        <div class="field"><input type="text" id="new-surg-year" placeholder="${lang==='es'?'Año':'Year'}"></div>
      </div>
      <button class="btn primary" id="add-surg">+ ${lang==='es'?'Añadir':'Add'}</button>
    </div>

    <div class="form-section">
      <h3>📞 ${ui('emergencyContact')}</h3>
      <div class="field"><label>${lang==='es'?'Nombre':'Name'}</label><input type="text" id="f-ec-name" value="${escapeHTML(profile.emergencyContact.name)}"></div>
      <div class="two-col">
        <div class="field"><label>${lang==='es'?'Relación':'Relation'}</label><input type="text" id="f-ec-rel" value="${escapeHTML(profile.emergencyContact.relation)}"></div>
        <div class="field"><label>${lang==='es'?'Teléfono':'Phone'}</label><input type="tel" id="f-ec-phone" value="${escapeHTML(profile.emergencyContact.phone)}"></div>
      </div>
    </div>

    <div class="form-section">
      <h3>📝 ${ui('notes')}</h3>
      <textarea id="f-notes" placeholder="${lang==='es'?'Cualquier cosa relevante que un médico deba saber...':'Anything relevant a doctor should know...'}">${escapeHTML(profile.notes)}</textarea>
    </div>

    <div class="form-section">
      <h3>🔒 ${lang==='es'?'PIN de edición':'Edit PIN'}</h3>
      <p class="empty-note" style="font-style:normal;">${lang==='es'
        ? 'Protege solo la edición de tus datos (no bloquea la Tarjeta de Emergencia ni el Modo médico, para que siempre se pueda usar en una urgencia).'
        : 'Protects only editing your data (does not lock the Emergency Card or Doctor mode, so it always works in an emergency).'}</p>
      ${getPin()
        ? `<div class="action-row"><button class="btn" id="change-pin">${lang==='es'?'Cambiar PIN':'Change PIN'}</button><button class="btn" id="remove-pin">${lang==='es'?'Quitar PIN':'Remove PIN'}</button></div>`
        : `<div class="two-col"><div class="field"><input type="text" inputmode="numeric" maxlength="6" id="new-pin" placeholder="${lang==='es'?'Crear PIN (4-6 dígitos)':'Create PIN (4-6 digits)'}"></div></div>
           <button class="btn primary" id="set-pin">${lang==='es'?'Activar PIN':'Enable PIN'}</button>`}
    </div>

    <div class="action-row"><button class="btn primary" id="save-all">💾 ${lang==='es'?'Guardar cambios':'Save changes'}</button></div>
  `;
  wireEditScreen();
}

let selectedSeverity = 'moderate';
function wireEditScreen(){
  document.querySelectorAll('.sev-opt').forEach(elm=>{
    if(elm.dataset.sev===selectedSeverity) elm.classList.add('selected');
    elm.onclick = () => {
      selectedSeverity = elm.dataset.sev;
      document.querySelectorAll('.sev-opt').forEach(e=>e.classList.remove('selected'));
      elm.classList.add('selected');
    };
  });

  document.getElementById('add-allergy').onclick = () => {
    const sel = document.getElementById('new-allergy-select').value;
    const custom = document.getElementById('new-allergy-custom').value.trim();
    if(!sel && !custom) return;
    profile.allergies.push({ id: uid(), key: sel || null, custom: sel?null:custom, severity: selectedSeverity });
    persistAndRerender();
  };
  document.getElementById('add-cond').onclick = () => {
    const sel = document.getElementById('new-cond-select').value;
    const custom = document.getElementById('new-cond-custom').value.trim();
    if(!sel && !custom) return;
    profile.conditions.push({ id: uid(), key: sel || null, custom: sel?null:custom });
    persistAndRerender();
  };
  document.getElementById('add-birth').onclick = () => {
    const sel = document.getElementById('new-birth-select').value;
    const custom = document.getElementById('new-birth-custom').value.trim();
    if(!sel && !custom) return;
    profile.birthConditions.push({ id: uid(), key: sel || null, custom: sel?null:custom });
    persistAndRerender();
  };
  document.getElementById('add-med').onclick = () => {
    const name = document.getElementById('new-med-name').value.trim();
    const dose = document.getElementById('new-med-dose').value.trim();
    if(!name) return;
    profile.medications.push({ id: uid(), name, dose });
    persistAndRerender();
  };
  document.getElementById('add-surg').onclick = () => {
    const name = document.getElementById('new-surg-name').value.trim();
    const year = document.getElementById('new-surg-year').value.trim();
    if(!name) return;
    profile.surgeries.push({ id: uid(), name, year });
    persistAndRerender();
  };

  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.del;
      ['allergies','conditions','birthConditions','medications','surgeries'].forEach(k=>{
        profile[k] = profile[k].filter(x=>x.id!==id);
      });
      persistAndRerender();
    };
  });

  const setPinBtn = document.getElementById('set-pin');
  if(setPinBtn){
    setPinBtn.onclick = () => {
      const val = document.getElementById('new-pin').value.trim();
      if(!/^\d{4,6}$/.test(val)){ alert(lang==='es'?'El PIN debe tener 4 a 6 números.':'PIN must be 4-6 digits.'); return; }
      setPin(val);
      editUnlockedThisSession = true;
      renderEditScreen();
    };
  }
  const changePinBtn = document.getElementById('change-pin');
  if(changePinBtn){
    changePinBtn.onclick = () => { removePin(); renderEditScreen(); };
  }
  const removePinBtn = document.getElementById('remove-pin');
  if(removePinBtn){
    removePinBtn.onclick = () => {
      if(confirm(lang==='es'?'¿Quitar el PIN de edición?':'Remove the edit PIN?')){ removePin(); renderEditScreen(); }
    };
  }

  document.getElementById('save-all').onclick = () => {
    profile.name = document.getElementById('f-name').value.trim();
    profile.dob = document.getElementById('f-dob').value;
    profile.sex = document.getElementById('f-sex').value;
    profile.bloodType = document.getElementById('f-blood').value;
    profile.emergencyContact.name = document.getElementById('f-ec-name').value.trim();
    profile.emergencyContact.relation = document.getElementById('f-ec-rel').value.trim();
    profile.emergencyContact.phone = document.getElementById('f-ec-phone').value.trim();
    profile.notes = document.getElementById('f-notes').value.trim();
    saveProfile(profile);
    goToScreen('card');
    renderApp();
  };
}
function persistAndRerender(){ saveProfile(profile); renderEditScreen(); }

/* ---------------- Nav ---------------- */
function promptForPin(){
  const backdrop = document.getElementById('pin-modal');
  document.getElementById('pin-input').value = '';
  document.getElementById('pin-error').textContent = '';
  backdrop.classList.remove('hidden');
  document.getElementById('pin-input').focus();
}

function goToScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(`screen-${name}`).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.screen===name));
}

/* ---------------- Init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => {
    if(b.dataset.screen === 'edit' && getPin() && !editUnlockedThisSession){
      promptForPin();
    } else {
      goToScreen(b.dataset.screen);
    }
  });

  document.getElementById('qr-close').onclick = () => document.getElementById('qr-modal').classList.add('hidden');

  document.getElementById('pin-cancel').onclick = () => document.getElementById('pin-modal').classList.add('hidden');
  document.getElementById('pin-confirm').onclick = () => {
    const val = document.getElementById('pin-input').value.trim();
    if(val === getPin()){
      editUnlockedThisSession = true;
      document.getElementById('pin-modal').classList.add('hidden');
      goToScreen('edit');
    } else {
      document.getElementById('pin-error').textContent = lang==='es' ? 'PIN incorrecto.' : 'Wrong PIN.';
    }
  };
  document.getElementById('pin-input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') document.getElementById('pin-confirm').click();
  });

  document.getElementById('lang-pill').onclick = () => {
    const idx = LANGS.findIndex(l=>l.code===lang);
    lang = LANGS[(idx+1) % LANGS.length].code;
    localStorage.setItem(LANG_KEY, lang);
    renderApp();
  };

  renderApp();
  goToScreen('card');

  // Service worker registration for offline + auto-update
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    });
  }

  // Install prompt handling
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const banner = document.getElementById('install-banner');

  if(isIOS && !isInStandaloneMode){
    // Safari no dispara beforeinstallprompt: mostramos instrucciones manuales.
    banner.innerHTML = `
      <span>📲 ${lang==='es'
        ? 'Para instalar: toca compartir (⬆️) abajo y elige "Añadir a pantalla de inicio"'
        : 'To install: tap Share (⬆️) below and choose "Add to Home Screen"'}</span>
    `;
    banner.classList.remove('hidden');
  } else if(!isInStandaloneMode) {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      banner.innerHTML = `<span>📲 ${lang==='es'?'Instala esta app en tu pantalla de inicio':'Install this app on your home screen'}</span><button id="install-btn">${lang==='es'?'Instalar':'Install'}</button>`;
      banner.classList.remove('hidden');
      document.getElementById('install-btn').onclick = async () => {
        if(!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        banner.classList.add('hidden');
      };
    });
  }

});
