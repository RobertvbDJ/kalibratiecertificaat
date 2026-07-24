// ═══════════════════════════════════════════════════════════════
//  Supabase-integratie voor Kalibratiecertificaat
//  ⚠️  VUL HIER JE EIGEN SUPABASE-GEGEVENS IN ⚠️
// ═══════════════════════════════════════════════════════════════
//  Zo maak je een project aan:
//  1. Ga naar https://supabase.com en maak een gratis account
//  2. Maak een nieuw project aan
//  3. Ga naar Project Settings > API
//  4. Kopieer de "Project URL" en "anon public key" hieronder
//  5. Voer schema.sql uit in de SQL Editor
//  6. Maak in Storage een bucket "company-images" (public)
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://jnfymnuozwstlawsqlae.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_MV1rGG-YU_yEGCRwYTkVCA_1xTz2efg';

// ═══════════════════════════════════════════════════════════════
//  Hieronder hoef je niets te wijzigen
// ═══════════════════════════════════════════════════════════════

;(function() {
  'use strict';

  if (typeof supabase === 'undefined') {
    console.error('Supabase client niet geladen. Voeg <script src="https://unpkg.com/@supabase/supabase-js@2"> toe vóór dit script.');
    return;
  }

  // ── Client initialiseren ──
    var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  var currentUser = null;

  // ── Auth ──
  async function initAuth() {
    var result = await client.auth.getSession();
    currentUser = result.data.session?.user ?? null;
    client.auth.onAuthStateChange(function(event, session) {
      currentUser = session?.user ?? null;
      if (window.supaOnAuthChange) window.supaOnAuthChange(currentUser);
    });
    return currentUser;
  }

  async function signUp(email, password) {
    var result = await client.auth.signUp({ email: email, password: password });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signIn(email, password) {
    var result = await client.auth.signInWithPassword({ email: email, password: password });
    if (result.error) throw result.error;
    currentUser = result.data.user;
    return result.data;
  }

  async function signOut() {
    var result = await client.auth.signOut();
    if (result.error) throw result.error;
    currentUser = null;
  }

  function isLoggedIn() { return currentUser !== null; }
  function getUser() { return currentUser; }

  // ── Company settings ──
  async function companyLoad() {
    if (!currentUser) return null;
    var result = await client.from('companies').select('*').eq('user_id', currentUser.id).maybeSingle();
    if (result.error) throw result.error;
    return result.data;
  }

  async function companySave(settings) {
    if (!currentUser) return;
    var payload = {
      user_id: currentUser.id,
      name: settings.companyName || '',
      short_name: settings.companyShort || '',
      address1: settings.address1 || '',
      address2: settings.address2 || '',
      website: settings.website || '',
      logo_url: settings.logoDataUrl || '',
      stempel_url: settings.stempelDataUrl || '',
      sig_url: settings.sigDataUrl || '',
      updated_at: new Date().toISOString()
    };
    await client.from('companies').upsert(payload, { onConflict: 'user_id' });
  }

  // ── Technicians ──
  async function techniciLoad() {
    if (!currentUser) return null;
    var result = await client.from('technicians').select('name').eq('user_id', currentUser.id).order('name');
    if (result.error) throw result.error;
    return result.data ? result.data.map(function(r) { return r.name; }) : [];
  }

  async function techniciSave(names) {
    if (!currentUser) return;
    await client.from('technicians').delete().eq('user_id', currentUser.id);
    if (names.length > 0) {
      var rows = names.map(function(name) { return { user_id: currentUser.id, name: name }; });
      await client.from('technicians').insert(rows);
    }
  }

  // ── Certificates ──
  async function certLoadList() {
    if (!currentUser) return [];
    var result = await client.from('certificates').select('id, certnr, client, created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    if (result.error) throw result.error;
    return result.data || [];
  }

  async function certSave(certData) {
    if (!currentUser) return;
    var payload = {
      user_id: currentUser.id,
      certnr: certData.certnr || '',
      client: certData.client || '',
      data: certData,
      updated_at: new Date().toISOString()
    };
    await client.from('certificates').insert(payload);
  }

  async function certDelete(id) {
    if (!currentUser) return;
    await client.from('certificates').delete().eq('id', id).eq('user_id', currentUser.id);
  }

  // ── File storage ──
  async function uploadImage(file, type) {
    if (!currentUser) throw new Error('Niet ingelogd');
    var ext = file.name.split('.').pop();
    var path = currentUser.id + '/' + type + '.' + ext;
    var result = await client.storage.from('company-images').upload(path, file, { upsert: true });
    if (result.error) throw result.error;
    var publicResult = client.storage.from('company-images').getPublicUrl(path);
    return publicResult.data.publicUrl;
  }

  // ── Sync: haal alle data van server → localStorage ──
  async function syncFromServer() {
    if (!currentUser) return;
    try {
      var [companyData, techniciNames] = await Promise.all([companyLoad(), techniciLoad()]);
      if (companyData) {
        var settings = {
          companyName: companyData.name || '',
          companyShort: companyData.short_name || '',
          address1: companyData.address1 || '',
          address2: companyData.address2 || '',
          website: companyData.website || '',
          logoDataUrl: companyData.logo_url || '',
          stempelDataUrl: companyData.stempel_url || '',
          sigDataUrl: companyData.sig_url || ''
        };
        if (window.localStorage) {
          localStorage.setItem('dj-company-settings', JSON.stringify(settings));
        }
      }
      if (techniciNames && window.localStorage) {
        localStorage.setItem('dj-technici', JSON.stringify(techniciNames));
      }
    } catch (e) {
      console.warn('Sync error:', e);
    }
  }

  // ── Sync: schrijf lokale data naar server ──
  async function syncToServer() {
    if (!currentUser) return;
    try {
      var localCompany = null;
      var localTechnici = null;
      try { localCompany = JSON.parse(localStorage.getItem('dj-company-settings')); } catch (e) {}
      try { localTechnici = JSON.parse(localStorage.getItem('dj-technici')); } catch (e) {}
      if (localCompany) await companySave(localCompany);
      if (localTechnici) await techniciSave(localTechnici);
    } catch (e) {
      console.warn('Sync error:', e);
    }
  }

  // ── Exposed API ──
  window.supa = {
    _client: client,
    initAuth: initAuth,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    companyLoad: companyLoad,
    companySave: companySave,
    techniciLoad: techniciLoad,
    techniciSave: techniciSave,
    certLoadList: certLoadList,
    certSave: certSave,
    certDelete: certDelete,
    uploadImage: uploadImage,
    syncFromServer: syncFromServer,
    syncToServer: syncToServer
  };

})();
