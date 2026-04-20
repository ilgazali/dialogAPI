const d = window.electronDialog;

// ─── Utility ──────────────────────────────────────────────────────────────
function show(label, data) {
  const box = document.getElementById('result-box');
  const ts = new Date().toLocaleTimeString('en-US');
  const formatted = JSON.stringify(data, null, 2);
  box.textContent = `[${ts}] ${label}\n${'─'.repeat(60)}\n${formatted}\n\n` + box.textContent;
}

function clearResult() {
  document.getElementById('result-box').textContent = 'Cleared.';
}

function showError(label, err) {
  show(label + ' [ERROR]', { error: err?.message ?? String(err) });
}

// ─── Event delegation (replaces inline onclick= which violates CSP) ────────
const ACTIONS = {
  openFile, openMultiple, openDirectory, openFileAndDir, openHidden,
  openFiltered, openWithTitle, openNoResolve, openTreatPkg,
  openPromptCreate, openDontAddRecent,
  openSync, openSyncMulti, openSyncDir,
  saveBasic, saveFiltered, saveCustomBtn, saveDefaultPath,
  saveNoOverwrite, saveHidden, saveDontAddRecent,
  saveSync, saveSyncFiltered,
  msgNone, msgInfo, msgError, msgQuestion, msgWarning,
  msgCheckbox, msgDetail, msgNoLink, msgNormalizeKeys,
  msgDefaultCancel, msgCustomIcon, msgManyButtons,
  msgTextWidth, msgAlwaysOnTop,
  msgAbortable, msgSync, msgSyncQuestion,
  errBasic, errLong, errUnicode,
  certTrust,
};

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (btn) ACTIONS[btn.dataset.action]?.();
});

document.getElementById('clear-btn').addEventListener('click', clearResult);

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showOpenDialog()  — async, returns Promise<{ canceled, filePaths }>
// ═══════════════════════════════════════════════════════════════════════════

async function openFile() {
  const r = await d.showOpenDialog({
    title: 'Select a File',
    buttonLabel: 'Open',
    properties: ['openFile'],
  });
  show('showOpenDialog  properties:["openFile"]', r);
}

async function openMultiple() {
  const r = await d.showOpenDialog({
    title: 'Select Multiple Files',
    properties: ['openFile', 'multiSelections'],
  });
  show('showOpenDialog  properties:["openFile","multiSelections"]', r);
}

async function openDirectory() {
  const r = await d.showOpenDialog({
    title: 'Select a Directory',
    properties: ['openDirectory', 'createDirectory'],
  });
  show('showOpenDialog  properties:["openDirectory","createDirectory"]', r);
}

async function openFileAndDir() {
  const r = await d.showOpenDialog({
    title: 'Select File or Directory',
    properties: ['openFile', 'openDirectory'],
  });
  show('showOpenDialog  properties:["openFile","openDirectory"]', r);
}

async function openHidden() {
  const r = await d.showOpenDialog({
    title: 'Show Hidden Files',
    properties: ['openFile', 'showHiddenFiles'],
  });
  show('showOpenDialog  properties:["showHiddenFiles"]', r);
}

async function openFiltered() {
  const r = await d.showOpenDialog({
    title: 'Select an Image',
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });
  show('showOpenDialog  filters:[Images, All Files]', r);
}

async function openWithTitle() {
  const r = await d.showOpenDialog({
    title: 'Select a Document',
    message: 'Please choose a document file',
    buttonLabel: 'Select & Open',
    filters: [
      { name: 'Documents', extensions: ['txt', 'md', 'pdf', 'docx'] },
    ],
    properties: ['openFile'],
  });
  show('showOpenDialog  title + message + buttonLabel + filters', r);
}

async function openNoResolve() {
  const r = await d.showOpenDialog({
    title: 'noResolveAliases (macOS)',
    properties: ['openFile', 'noResolveAliases'],
  });
  show('showOpenDialog  properties:["noResolveAliases"]  (macOS)', r);
}

async function openTreatPkg() {
  const r = await d.showOpenDialog({
    title: 'treatPackageAsDirectory (macOS)',
    properties: ['openDirectory', 'treatPackageAsDirectory'],
  });
  show('showOpenDialog  properties:["treatPackageAsDirectory"]  (macOS)', r);
}

async function openPromptCreate() {
  const r = await d.showOpenDialog({
    title: 'promptToCreate (Windows)',
    message: 'Type a folder path that does not exist to test prompt-to-create',
    properties: ['openDirectory', 'promptToCreate'],
  });
  show('showOpenDialog  properties:["promptToCreate"]  (Windows)', r);
}

async function openDontAddRecent() {
  const r = await d.showOpenDialog({
    title: 'dontAddToRecent',
    properties: ['openFile', 'dontAddToRecent'],
  });
  show('showOpenDialog  properties:["dontAddToRecent"]', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showOpenDialogSync()  — sync, returns string[] | undefined
// ═══════════════════════════════════════════════════════════════════════════

async function openSync() {
  const r = await d.showOpenDialogSync({
    title: 'showOpenDialogSync — Select File',
    properties: ['openFile'],
  });
  show('showOpenDialogSync  properties:["openFile"]  → string[] | undefined', r);
}

async function openSyncMulti() {
  const r = await d.showOpenDialogSync({
    title: 'showOpenDialogSync — Multiple Selection',
    properties: ['openFile', 'multiSelections'],
  });
  show('showOpenDialogSync  properties:["multiSelections"]  → string[] | undefined', r);
}

async function openSyncDir() {
  const r = await d.showOpenDialogSync({
    title: 'showOpenDialogSync — Select Directory',
    properties: ['openDirectory'],
  });
  show('showOpenDialogSync  properties:["openDirectory"]  → string[] | undefined', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showSaveDialog()  — async, returns Promise<{ canceled, filePath }>
// ═══════════════════════════════════════════════════════════════════════════

async function saveBasic() {
  const r = await d.showSaveDialog({
    title: 'Save File',
  });
  show('showSaveDialog  (no options)', r);
}

async function saveFiltered() {
  const r = await d.showSaveDialog({
    title: 'Save File — filters',
    defaultPath: 'new-file.txt',
    filters: [
      { name: 'Text', extensions: ['txt'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  show('showSaveDialog  filters:[txt, md, json]', r);
}

async function saveCustomBtn() {
  const r = await d.showSaveDialog({
    title: 'Save File — buttonLabel',
    buttonLabel: 'Save & Continue',
    defaultPath: 'report.pdf',
  });
  show('showSaveDialog  buttonLabel:"Save & Continue"', r);
}

async function saveDefaultPath() {
  const homePath = await d.getHomePath();
  const r = await d.showSaveDialog({
    title: 'Save File — defaultPath',
    defaultPath: `${homePath}/Desktop/electron-demo-output.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  show('showSaveDialog  defaultPath:~/Desktop/electron-demo-output.json', r);
}

async function saveHidden() {
  const r = await d.showSaveDialog({
    title: 'Save File — showHiddenFiles',
    defaultPath: 'output.txt',
    properties: ['showHiddenFiles'],
  });
  show('showSaveDialog  properties:["showHiddenFiles"]', r);
}

async function saveDontAddRecent() {
  const r = await d.showSaveDialog({
    title: 'Save File — dontAddToRecent',
    defaultPath: 'output.txt',
    properties: ['dontAddToRecent'],
  });
  show('showSaveDialog  properties:["dontAddToRecent"]  (Windows)', r);
}

async function saveNoOverwrite() {
  const r = await d.showSaveDialog({
    title: 'Save File — showOverwriteConfirmation',
    defaultPath: 'existing-file.txt',
    properties: ['showOverwriteConfirmation'],
  });
  show('showSaveDialog  properties:["showOverwriteConfirmation"]  (Linux)', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showSaveDialogSync()  — sync, returns string (empty if cancelled)
// ═══════════════════════════════════════════════════════════════════════════

async function saveSync() {
  const r = await d.showSaveDialogSync({
    title: 'showSaveDialogSync — Basic',
    defaultPath: 'sync-output.txt',
  });
  show('showSaveDialogSync  (no options)  → string', r);
}

async function saveSyncFiltered() {
  const r = await d.showSaveDialogSync({
    title: 'showSaveDialogSync — filters',
    filters: [
      { name: 'CSV', extensions: ['csv'] },
      { name: 'Excel', extensions: ['xlsx'] },
    ],
  });
  show('showSaveDialogSync  filters:[csv, xlsx]  → string', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showMessageBox()  — async, returns Promise<{ response, checkboxChecked }>
// type option: none | info | error | question | warning
// ═══════════════════════════════════════════════════════════════════════════

async function msgNone() {
  const r = await d.showMessageBox({
    type: 'none',
    title: 'type: "none"',
    message: 'No icon is shown when type is "none"',
    detail: 'The type option controls the system icon. "none" means no icon.',
    buttons: ['OK'],
  });
  show('showMessageBox  type:"none"', r);
}

async function msgInfo() {
  const r = await d.showMessageBox({
    type: 'info',
    title: 'type: "info"',
    message: 'Information message box',
    detail: 'Use type "info" to inform the user about a successful or neutral event.',
    buttons: ['Got it'],
  });
  show('showMessageBox  type:"info"', r);
}

async function msgError() {
  const r = await d.showMessageBox({
    type: 'error',
    title: 'type: "error"',
    message: 'An error occurred',
    detail: 'Use type "error" when an operation has failed.',
    buttons: ['Close'],
  });
  show('showMessageBox  type:"error"', r);
}

async function msgQuestion() {
  const r = await d.showMessageBox({
    type: 'question',
    title: 'type: "question"',
    message: 'Confirm action',
    detail: 'Are you sure you want to proceed with this action?',
    buttons: ['Yes', 'No', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
  });
  show('showMessageBox  type:"question"  defaultId:0  cancelId:2', r);
}

async function msgWarning() {
  const r = await d.showMessageBox({
    type: 'warning',
    title: 'type: "warning"',
    message: 'Warning!',
    detail: 'This action may be irreversible. Proceed with caution.',
    buttons: ['Continue', 'Cancel'],
    defaultId: 1,
  });
  show('showMessageBox  type:"warning"  defaultId:1', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showMessageBox()  — advanced options
// ═══════════════════════════════════════════════════════════════════════════

async function msgCheckbox() {
  const r = await d.showMessageBox({
    type: 'question',
    title: 'checkboxLabel + checkboxChecked',
    message: "Don't show this message again?",
    detail: 'checkboxLabel adds a checkbox to the dialog.\ncheckboxChecked sets its initial state.\nThe resolved object includes checkboxChecked.',
    buttons: ['OK', 'Cancel'],
    checkboxLabel: "Don't show again",
    checkboxChecked: false,
  });
  show('showMessageBox  checkboxLabel  →  { response, checkboxChecked }', r);
}

async function msgDetail() {
  const r = await d.showMessageBox({
    type: 'info',
    title: 'detail option',
    message: 'This is the "message" field',
    detail: 'This is the "detail" field.\nIt can span multiple lines.\nShown in smaller text below the main message.',
    buttons: ['Close'],
  });
  show('showMessageBox  detail option', r);
}

async function msgNoLink() {
  const r = await d.showMessageBox({
    type: 'info',
    title: 'noLink: true  (Windows)',
    message: 'noLink disables command-link button style',
    detail: 'On Windows, Electron renders some buttons as command links.\nSetting noLink: true forces standard button style.',
    buttons: ['Option A', 'Option B', 'Option C'],
    noLink: true,
  });
  show('showMessageBox  noLink:true  (Windows)', r);
}

async function msgNormalizeKeys() {
  const r = await d.showMessageBox({
    type: 'question',
    title: 'normalizeAccessKeys: true',
    message: 'normalizeAccessKeys converts & to platform-specific access keys',
    detail: '&OK  →  macOS: "OK"  |  Linux: "_OK" (Alt+O)  |  Windows: "&OK" (Alt+O)',
    buttons: ['&OK', '&Cancel', '&Help'],
    normalizeAccessKeys: true,
  });
  show('showMessageBox  normalizeAccessKeys:true  buttons:["&OK","&Cancel","&Help"]', r);
}

async function msgDefaultCancel() {
  const r = await d.showMessageBox({
    type: 'warning',
    title: 'defaultId + cancelId',
    message: 'defaultId: button focused on Enter  |  cancelId: button triggered by Esc',
    detail: 'defaultId:1 → "Undo" is focused by default (Enter key).\ncancelId:2 → "Cancel" is triggered by the Escape key.',
    buttons: ['Delete', 'Undo', 'Cancel'],
    defaultId: 1,
    cancelId: 2,
  });
  show('showMessageBox  defaultId:1  cancelId:2  →  response index', r);
}

async function msgCustomIcon() {
  // 16×16 orange square PNG (base64) — converted to NativeImage in main process
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAATklEQVQ4T2NkoBAwUqifYdQABgYGBiUlJf9RA+j' +
    'BAAMDAwMjI+N/dAMYGRn/MzAwMKAbwMTExA8ygIGBgYGJiYkBbgAjIyMDugEA6EQPAf7MxNUAAAAASUVORK5CYII=';
  const r = await d.showMessageBox({
    type: 'info',
    title: 'icon option (NativeImage)',
    message: 'Custom icon via nativeImage.createFromDataURL()',
    detail: 'The renderer sends a base64 PNG string to the main process.\nThe main process creates a NativeImage and passes it as the icon option.',
    buttons: ['OK'],
    iconBase64: pngBase64,
  });
  show('showMessageBox  icon:NativeImage (base64 PNG)', r);
}

async function msgTextWidth() {
  const r = await d.showMessageBox({
    type: 'info',
    title: 'textWidth (macOS only)',
    message: 'textWidth controls the custom text width of the message box',
    detail: 'textWidth: 400 sets the text column width in pixels.\nThis option only has effect on macOS.',
    buttons: ['OK'],
    textWidth: 400,
  });
  show('showMessageBox  textWidth:400  (macOS only)', r);
}

async function msgAlwaysOnTop() {
  const r = await d.showMessageBox({
    type: 'warning',
    title: 'alwaysOnTop (macOS only)',
    message: 'alwaysOnTop: true',
    detail: 'The dialog stays above all other windows even when the app loses focus.\nThis option only has effect on macOS.',
    buttons: ['Understood'],
    alwaysOnTop: true,
  });
  show('showMessageBox  alwaysOnTop:true  (macOS only)', r);
}

async function msgManyButtons() {
  const r = await d.showMessageBox({
    type: 'question',
    title: 'buttons[] — multiple choices',
    message: 'What would you like to do?',
    detail: 'buttons[] can hold as many labels as needed.\nThe resolved "response" value is the zero-based index of the clicked button.',
    buttons: ['Save', 'Save & Close', "Don't Save", 'Cancel', 'Help'],
    defaultId: 0,
    cancelId: 3,
    noLink: false,
  });
  show('showMessageBox  buttons[5]  defaultId:0  cancelId:3  →  response index', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showMessageBox()  — signal: AbortSignal
// ═══════════════════════════════════════════════════════════════════════════

async function msgAbortable() {
  show('showMessageBox  signal:AbortSignal', { status: 'Dialog opening — will auto-cancel in 4 seconds...' });
  const r = await d.showMessageBoxAbortable();
  show('showMessageBox  signal:AbortSignal  → result', r);
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showMessageBoxSync()  — sync, returns Integer (button index)
// ═══════════════════════════════════════════════════════════════════════════

async function msgSync() {
  const r = await d.showMessageBoxSync({
    type: 'info',
    title: 'showMessageBoxSync',
    message: 'Synchronous message box',
    detail: 'The main process is blocked until this dialog is closed.\nReturn value: Integer — the index of the clicked button.',
    buttons: ['OK', 'Cancel'],
  });
  show('showMessageBoxSync  (no defaultId/cancelId)  → Integer', r);
}

async function msgSyncQuestion() {
  const r = await d.showMessageBoxSync({
    type: 'question',
    title: 'showMessageBoxSync — type:"question"',
    message: 'Do you want to continue?',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1,
  });
  show('showMessageBoxSync  type:"question"  defaultId:0  cancelId:1', { returnedIndex: r, clickedLabel: r === 0 ? 'Yes' : 'No' });
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showErrorBox(title, content)
// ═══════════════════════════════════════════════════════════════════════════

async function errBasic() {
  await d.showErrorBox('Error', 'showErrorBox basic usage.\nSafe to call before the app ready event.');
  show('showErrorBox  title + content', { completed: true });
}

async function errLong() {
  const content =
    'showErrorBox with long content.\n\n' +
    'Stack trace:\n' +
    '  at Object.<anonymous> (app.js:42:13)\n' +
    '  at Module._compile (node:internal/modules:1358:14)\n' +
    '  at Object.Module._extensions (node:internal/modules:1416:10)\n' +
    '  at Module.load (node:internal/modules:1208:32)\n\n' +
    'A critical error occurred. Please contact the administrator.';
  await d.showErrorBox('Critical Error — Long Content', content);
  show('showErrorBox  long content (stack trace)', { completed: true });
}

async function errUnicode() {
  await d.showErrorBox(
    '⚠️ Error / Erreur / Fehler / Hata',
    'Unicode test:\n' +
    'Turkish: ğüşıöçÇÖŞİÜĞ\n' +
    'Japanese: エラーが発生しました\n' +
    'Arabic: حدث خطأ\n' +
    'Emoji: 🚨🔥💥'
  );
  show('showErrorBox  Unicode characters (CJK, Arabic, Emoji)', { completed: true });
}

// ═══════════════════════════════════════════════════════════════════════════
// dialog.showCertificateTrustDialog()  — macOS / Windows only
// Returns Promise<void>
// ═══════════════════════════════════════════════════════════════════════════

async function certTrust() {
  show('showCertificateTrustDialog  { certificate, message }', { status: 'Opening dialog...' });
  const r = await d.showCertificateTrustDialog();
  show('showCertificateTrustDialog  → Promise<void>', r);
}
