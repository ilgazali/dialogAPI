const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Electron 36 – Dialog API Demo',
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── app paths ────────────────────────────────────────────────────────────
ipcMain.handle('app:getHomePath', () => os.homedir());

// ─── showOpenDialog (async) ────────────────────────────────────────────────
ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// ─── showOpenDialogSync ────────────────────────────────────────────────────
ipcMain.handle('dialog:showOpenDialogSync', (_, options) => {
  const result = dialog.showOpenDialogSync(mainWindow, options);
  return result ?? null;
});

// ─── showSaveDialog (async) ────────────────────────────────────────────────
ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// ─── showSaveDialogSync ────────────────────────────────────────────────────
ipcMain.handle('dialog:showSaveDialogSync', (_, options) => {
  const result = dialog.showSaveDialogSync(mainWindow, options);
  return result ?? null;
});

// ─── showMessageBox (async) ────────────────────────────────────────────────
ipcMain.handle('dialog:showMessageBox', async (_, options) => {
  if (options.iconBase64) {
    options.icon = nativeImage.createFromDataURL(`data:image/png;base64,${options.iconBase64}`);
    delete options.iconBase64;
  }
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// ─── showMessageBox with AbortSignal ──────────────────────────────────────
ipcMain.handle('dialog:showMessageBoxAbortable', async () => {
  const controller = new AbortController();
  const { signal } = controller;

  // Auto-abort after 4 seconds to demonstrate the feature
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'AbortSignal Demo',
      message: 'Bu dialog 4 saniye sonra otomatik kapanacak!',
      detail: 'AbortController ile dialog.showMessageBox iptal edilebilir.\nBekleyin veya manuel kapatın.',
      buttons: ['Tamam', 'İptal'],
      defaultId: 0,
    }, signal);
    clearTimeout(timer);
    return { aborted: false, ...result };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { aborted: true, response: -1, checkboxChecked: false };
    }
    throw err;
  }
});

// ─── showMessageBoxSync ────────────────────────────────────────────────────
ipcMain.handle('dialog:showMessageBoxSync', (_, options) => {
  const result = dialog.showMessageBoxSync(mainWindow, options);
  return result;
});

// ─── showErrorBox ──────────────────────────────────────────────────────────
ipcMain.handle('dialog:showErrorBox', (_, title, content) => {
  dialog.showErrorBox(title, content);
  return null;
});

// ─── showCertificateTrustDialog (macOS / Windows only) ────────────────────
// ─── Builds a minimal but valid self-signed X.509v1 DER certificate ────────
function generateDemoCert() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  // SubjectPublicKeyInfo — Node exports this directly as DER
  const spkiDer = publicKey.export({ type: 'spki', format: 'der' });

  // ASN.1 DER primitives
  function tlv(tag, value) {
    const len = value.length;
    let hdr;
    if (len <= 0x7f)       hdr = Buffer.from([tag, len]);
    else if (len <= 0xff)  hdr = Buffer.from([tag, 0x81, len]);
    else                   hdr = Buffer.from([tag, 0x82, (len >> 8) & 0xff, len & 0xff]);
    return Buffer.concat([hdr, value]);
  }
  const SEQ  = v => tlv(0x30, v);
  const SET  = v => tlv(0x31, v);
  const OID  = b => tlv(0x06, Buffer.from(b));
  const INT  = b => tlv(0x02, Buffer.from(b));
  const UTF8 = s => tlv(0x0c, Buffer.from(s, 'utf8'));
  const UTCT = s => tlv(0x17, Buffer.from(s, 'ascii'));
  const BITS = b => tlv(0x03, Buffer.concat([Buffer.from([0x00]), b]));
  const NULL = ()  => Buffer.from([0x05, 0x00]);

  // sha256WithRSAEncryption  OID 1.2.840.113549.1.1.11
  const algId = SEQ(Buffer.concat([
    OID([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]),
    NULL(),
  ]));

  // Name: CN=Electron Dialog Demo
  const name = SEQ(SET(SEQ(Buffer.concat([
    OID([0x55, 0x04, 0x03]),
    UTF8('Electron Dialog Demo'),
  ]))));

  // Validity: 2020-01-01 → 2049-12-31
  const validity = SEQ(Buffer.concat([
    UTCT('200101000000Z'),
    UTCT('491231235959Z'),
  ]));

  // TBSCertificate (X.509 v1 — no version field, no extensions)
  const tbs = SEQ(Buffer.concat([
    INT([0x01]),  // serialNumber = 1
    algId,        // signature algorithm
    name,         // issuer
    validity,
    name,         // subject (self-signed → same as issuer)
    spkiDer,      // subjectPublicKeyInfo
  ]));

  const signature = crypto.createSign('SHA256').update(tbs).sign(privateKey);

  // Certificate ::= SEQUENCE { tbsCertificate, signatureAlgorithm, signatureValue }
  return SEQ(Buffer.concat([tbs, algId, BITS(signature)]));
}

ipcMain.handle('dialog:showCertificateTrustDialog', async () => {
  if (process.platform === 'linux') {
    return { supported: false };
  }
  try {
    const certDer = generateDemoCert();
    await dialog.showCertificateTrustDialog(mainWindow, {
      // data must be the raw DER bytes as a binary string (Latin-1)
      certificate: { data: certDer.toString('binary') },
      message: 'Demo self-signed certificate generated at runtime.\nDo you want to trust it?',
    });
    return { supported: true, completed: true };
  } catch (err) {
    return { supported: true, completed: false, error: err.message };
  }
});
