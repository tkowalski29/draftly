import { parseAndValidate } from './parser';
import { renderTree } from './renderer';
import { log } from './utils';

console.log('🚀 Plugin code loaded!');

figma.ui.onmessage = async (msg) => {
  console.log('📨 Received message:', msg);
  
  if (msg.type === 'render-json') {
    log('Otrzymano JSON z pliku.');
    const data = parseAndValidate(msg.data);
    if (data) {
      await renderTree(data);
    }
  }

  if (msg.type === 'render-url') {
    const url = msg.data;
    log(`Pobieranie danych z URL: ${url}`);
    try {
      const response = await fetch(url);
      const jsonString = await response.text();
      const data = parseAndValidate(jsonString);
      if (data) {
        await renderTree(data);
      }
    } catch (e: any) {
      log(`Błąd podczas pobierania z URL: ${e.message}`, 'error');
    }
  }
  
  if (msg.type === 'setting-change') {
    console.log('⚙️ Setting changed:', msg.data);
    // Przechowywaj ustawienia w figma.clientStorage
    figma.clientStorage.setAsync(msg.data.setting, msg.data.value);
  }

  if (msg.type === 'log') {
    console.log('[UI]', ...msg.data);
  }
};

// Use the new tabbed UI from code-simple.ts
const uiHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Draftly Plugin</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff; height: 100vh; display: flex; flex-direction: column; }
    
    .header { padding: 16px; border-bottom: 1px solid #e1e5e9; background: white; }
    .logo { font-size: 16px; font-weight: 600; color: #2c2c2c; margin: 0; }
    
    .content { flex: 1; overflow-y: auto; padding: 16px; }
    
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .bottom-nav { display: flex; border-top: 1px solid #e1e5e9; background: white; }
    .nav-item { flex: 1; padding: 12px 8px; text-align: center; cursor: pointer; border: none; background: none; color: #666; font-size: 12px; transition: all 0.2s; }
    .nav-item.active { color: #18a0fb; background: #f0f8ff; }
    .nav-item:hover { background: #f5f5f5; }
    
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #2c2c2c; }
    .form-group { margin-bottom: 12px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #2c2c2c; }
    input[type="file"], input[type="text"] { width: 100%; padding: 8px 12px; border: 1px solid #d1d5d9; border-radius: 6px; font-size: 13px; }
    input:focus { outline: none; border-color: #18a0fb; box-shadow: 0 0 0 3px rgba(24, 160, 251, 0.1); }
    .btn-primary { width: 100%; padding: 8px 12px; background: #18a0fb; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-primary:hover { background: #1590e8; }
    .divider { text-align: center; color: #999; font-size: 12px; margin: 16px 0; position: relative; }
    .divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e1e5e9; z-index: 1; }
    .divider span { background: white; padding: 0 12px; position: relative; z-index: 2; }
    
    .status { font-size: 12px; color: #10b981; font-weight: 500; margin-bottom: 16px; }
    
    .task-item { padding: 12px; border: 1px solid #e1e5e9; border-radius: 6px; margin-bottom: 8px; }
    .task-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
    .task-desc { font-size: 12px; color: #666; }
    .task-status { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; }
    .task-status.completed { background: #dcfce7; color: #166534; }
    .task-status.pending { background: #fef3c7; color: #92400e; }
    .task-status.running { background: #dbeafe; color: #1d4ed8; }
    
    .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
    .toggle { width: 40px; height: 20px; background: #e1e5e9; border-radius: 10px; position: relative; cursor: pointer; transition: background 0.2s; }
    .toggle.active { background: #18a0fb; }
    .toggle-thumb { width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.2s; }
    .toggle.active .toggle-thumb { left: 22px; }
    
    .version { text-align: center; font-size: 11px; color: #999; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">Draftly</h1>
  </div>

  <div class="content">
    <div id="import-tab" class="tab-content active">
      <div class="status">✅ Plugin gotowy do użycia</div>
      
      <div class="section">
        <div class="section-title">Import z pliku</div>
        <div class="form-group">
          <label for="file-input">Wybierz plik JSON</label>
          <input id="file-input" type="file" accept=".json">
        </div>
      </div>

      <div class="divider"><span>LUB</span></div>

      <div class="section">
        <div class="section-title">Import z URL</div>
        <div class="form-group">
          <label for="url-input">Podaj URL do pliku JSON</label>
          <input id="url-input" type="text" placeholder="https://example.com/data.json">
        </div>
        <button id="url-button" class="btn-primary">Renderuj z URL</button>
      </div>
    </div>

    <div id="task-tab" class="tab-content">
      <div class="section">
        <div class="section-title">Ostatnie zadania</div>
        <div class="task-item">
          <div class="task-title">Import Button Showcase</div>
          <div class="task-desc">Zaimportowano 12 elementów</div>
          <span class="task-status completed">Ukończone</span>
        </div>
        <div class="task-item">
          <div class="task-title">Layout Examples</div>
          <div class="task-desc">W trakcie renderowania...</div>
          <span class="task-status running">W trakcie</span>
        </div>
      </div>
    </div>

    <div id="settings-tab" class="tab-content">
      <div class="section">
        <div class="section-title">Ustawienia renderowania</div>
        <div class="settings-item">
          <div>
            <div style="font-weight: 500; font-size: 13px;">Auto Layout</div>
            <div style="font-size: 11px; color: #666;">Automatycznie stosuj Auto Layout</div>
          </div>
          <div class="toggle active" data-setting="auto-layout">
            <div class="toggle-thumb"></div>
          </div>
        </div>
        <div class="settings-item">
          <div>
            <div style="font-weight: 500; font-size: 13px;">Zaawansowane cienie</div>
            <div style="font-size: 11px; color: #666;">Renderuj efekty cieni</div>
          </div>
          <div class="toggle active" data-setting="shadows">
            <div class="toggle-thumb"></div>
          </div>
        </div>
        <div class="settings-item">
          <div>
            <div style="font-weight: 500; font-size: 13px;">Notyfikacje</div>
            <div style="font-size: 11px; color: #666;">Pokazuj powiadomienia o postępie</div>
          </div>
          <div class="toggle active" data-setting="notifications">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>
      
      <div class="version">Draftly v1.0.0</div>
    </div>
  </div>

  <div class="bottom-nav">
    <button class="nav-item active" data-tab="import">
      <div>📥</div>
      <div>Import</div>
    </button>
    <button class="nav-item" data-tab="task">
      <div>📋</div>
      <div>Task</div>
    </button>
    <button class="nav-item" data-tab="settings">
      <div>⚙️</div>
      <div>Settings</div>
    </button>
  </div>

  <script>
    console.log('🚀 UI loaded with tabs!');
    
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab') + '-tab';
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    document.getElementById('file-input').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          parent.postMessage({ pluginMessage: { type: 'render-json', data: content } }, '*');
        };
        reader.readAsText(file);
      }
    });
    
    document.getElementById('url-button').addEventListener('click', function() {
      const url = document.getElementById('url-input').value;
      if (url) {
        parent.postMessage({ pluginMessage: { type: 'render-url', data: url } }, '*');
      }
    });
    
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active');
        const setting = this.getAttribute('data-setting');
        const isActive = this.classList.contains('active');
        parent.postMessage({ 
          pluginMessage: { 
            type: 'setting-change', 
            data: { setting, value: isActive } 
          } 
        }, '*');
      });
    });
  </script>
</body>
</html>`;

figma.showUI(uiHTML, { width: 340, height: 420 });
console.log('🎉 Plugin initialized successfully!');
