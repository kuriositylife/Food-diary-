// script.js — sends a Food Diary entry to a Google Sheet via Apps Script.
//
// Setup: deploy Code.gs as a Web App (see SHEETS_SETUP.md), then paste its
// URL below. Leaving it as the placeholder disables syncing gracefully.

const SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_NWnXV4uZmydUN-RKTY9mVc9c0oyxdPdJjuEbVCD0mb8v1Lr8oxwPs_Q9E2SA0hE/exec';

// Must exactly match SHARED_TOKEN in Code.gs. Change both to the same random string.
const SHEET_TOKEN = 'change-me-to-a-random-string';

/**
 * Send one entry to the Google Sheet.
 * @param {Object} entry - { text, time (ISO), nutrition:{calories,protein,fat,carbs,sugar} }
 * @returns {Promise<boolean>} true if the request was sent (not the same as confirmed saved)
 *
 * Note: Apps Script Web Apps don't send CORS headers, so we use no-cors mode.
 * The row is still written, but the browser can't read the response, so we
 * can't truly confirm success from here — we resolve true once the request goes out.
 */
async function sendToSheet(entry) {
  if (!SHEET_SCRIPT_URL || SHEET_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    return false; // not configured yet — skip silently
  }

  const n = entry.nutrition || {};
  const payload = {
    token: SHEET_TOKEN,                     // shared secret checked by Code.gs
    name: entry.name || '',
    time: entry.time,                       // ISO timestamp saved automatically
    food: entry.text,
    calories: n.calories ?? '',
    protein:  n.protein  ?? '',
    fat:      n.fat      ?? '',
    carbs:    n.carbs    ?? '',
    sugar:    n.sugar    ?? ''
  };

  try {
    await fetch(SHEET_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain avoids a CORS preflight
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.error('Sheet sync failed:', err.message);
    return false;
  }
}
