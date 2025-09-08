import { parseAndValidate } from './parser';
import { renderTree } from './renderer';
import { log } from './utils';
import { logger } from './logger';

console.log('🚀 DRAFTLY - Plugin code loaded!');

// Enhanced message handling with detailed logging
figma.ui.onmessage = async (msg) => {
  log(`📨 Otrzymano wiadomość typu: ${msg.type}`);
  
  if (msg.type === 'render-json') {
    const importType = msg.importType || 'default';
    log(`📥 Rozpoczynam przetwarzanie JSON z pliku, typ: ${importType}`, 'log', null, importType);
    const data = parseAndValidate(msg.data);
    if (data) {
      log('✅ JSON zwalidowany, rozpoczynam renderowanie...', 'log', null, importType);
      try {
        await renderTree(data);
        log('🎉 Import zakończony pomyślnie', 'log', null, importType, 1);
      } catch (error: any) {
        log(`❌ KRYTYCZNY BŁĄD podczas renderowania: ${error.message}`, 'error', error, importType);
        console.error('Full error:', error);
      }
    } else {
      log('❌ Walidacja JSON nie powiodła się', 'error', null, importType);
    }
  }

  if (msg.type === 'render-folder') {
    const folderData = msg.data;
    const importType = msg.importType;
    const filesCount = Object.keys(folderData).length;
    log(`📁 Renderowanie folderu w trybie: ${importType}`, 'log', null, importType, filesCount);
    log(`📊 Znaleziono ${filesCount} plików`, 'log', null, importType, filesCount);
    
    try {
      await renderTree(folderData, importType);
      log('🎉 Import folderu zakończony pomyślnie', 'log', null, importType, filesCount);
    } catch (error: any) {
      log(`❌ BŁĄD podczas renderowania folderu: ${error.message}`, 'error', error, importType, filesCount);
    }
  }
  
  if (msg.type === 'setting-change') {
    figma.clientStorage.setAsync(msg.data.setting, msg.data.value);
  }

  if (msg.type === 'export-logs') {
    const logs = logger.getLogsForExport();
    figma.ui.postMessage({
      type: 'logs-export',
      data: logs,
      fileName: `draftly-logs-${new Date().toISOString().split('T')[0]}.json`
    });
  }
};

const uiHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: #f8f9fa; 
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 16px; 
      text-align: center; 
    }
    .logo { font-size: 18px; font-weight: 700; margin: 0; }
    
    .content { 
      flex: 1;
      padding: 16px; 
      padding-bottom: 70px;
      overflow-y: auto;
    }
    
    .main-tab-content { display: none; }
    .main-tab-content.active { display: block; }
    
    /* Import section with sub-tabs */
    .sub-nav { 
      display: flex; 
      background: white; 
      border-radius: 8px; 
      margin-bottom: 16px;
      border: 1px solid #e1e5e9;
    }
    .sub-tab { 
      flex: 1; 
      padding: 10px 12px; 
      text-align: center; 
      cursor: pointer; 
      border: none; 
      background: none; 
      color: #666; 
      font-size: 13px; 
      transition: all 0.2s;
      border-radius: 8px;
    }
    .sub-tab.active { 
      color: #18a0fb; 
      background: #f0f8ff; 
      font-weight: 500;
    }
    .sub-tab:hover:not(.active) { background: #f5f5f5; }
    
    .sub-content { display: none; }
    .sub-content.active { display: block; }
    
    .bottom-nav { 
      position: fixed; 
      bottom: 0; 
      left: 0; 
      right: 0; 
      background: white; 
      border-top: 1px solid #e1e5e9; 
      display: flex; 
    }
    .nav-item { 
      flex: 1; 
      padding: 12px 8px; 
      text-align: center; 
      cursor: pointer; 
      border: none; 
      background: none; 
      color: #666; 
      font-size: 12px; 
      transition: all 0.2s; 
    }
    .nav-item.active { color: #18a0fb; background: #f0f8ff; }
    .nav-item:hover:not(.active) { background: #f5f5f5; }
    
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #2c2c2c; }
    .form-group { margin-bottom: 12px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #2c2c2c; }
    input[type="file"], input[type="text"] { 
      width: 100%; 
      padding: 8px 12px; 
      border: 1px solid #d1d5d9; 
      border-radius: 6px; 
      font-size: 13px; 
    }
    input:focus { outline: none; border-color: #18a0fb; box-shadow: 0 0 0 3px rgba(24, 160, 251, 0.1); }
    .btn-primary { 
      width: 100%; 
      padding: 8px 12px; 
      background: #18a0fb; 
      color: white; 
      border: none; 
      border-radius: 6px; 
      font-size: 13px; 
      font-weight: 500; 
      cursor: pointer; 
      margin-bottom: 8px;
    }
    .btn-primary:hover { background: #1590e8; }
    
    .btn-secondary {
      width: 100%; 
      padding: 8px 12px; 
      background: #6b7280; 
      color: white; 
      border: none; 
      border-radius: 6px; 
      font-size: 13px; 
      font-weight: 500; 
      cursor: pointer; 
      margin-bottom: 8px;
    }
    .btn-secondary:hover { background: #4b5563; }
    
    .btn-danger {
      width: 100%; 
      padding: 8px 12px; 
      background: #ef4444; 
      color: white; 
      border: none; 
      border-radius: 6px; 
      font-size: 13px; 
      font-weight: 500; 
      cursor: pointer; 
      margin-bottom: 8px;
    }
    .btn-danger:hover { background: #dc2626; }
    
    select {
      width: 100%; 
      padding: 8px 12px; 
      border: 1px solid #d1d5d9; 
      border-radius: 6px; 
      font-size: 13px; 
      background: white;
    }
    select:focus { outline: none; border-color: #18a0fb; box-shadow: 0 0 0 3px rgba(24, 160, 251, 0.1); }
    
    input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }
    
    label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    
    .status { 
      font-size: 12px; 
      color: #10b981; 
      font-weight: 500; 
      margin-bottom: 16px; 
      padding: 8px 12px;
      background: #f0fdf4;
      border-radius: 6px;
      border: 1px solid #bbf7d0;
    }
    
    .version { 
      text-align: center; 
      font-size: 24px; 
      font-weight: 700;
      color: #2c2c2c; 
      margin-top: 40px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
    }
    
    .example-path {
      font-size: 11px;
      color: #666;
      font-style: italic;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">Draftly</h1>
  </div>

  <div class="content">
    <!-- Import Tab -->
    <div id="import-tab" class="main-tab-content active">
      <!-- Sub navigation -->
      <div class="sub-nav">
        <button class="sub-tab active" data-subtab="folder">📁 Import Folder</button>
        <button class="sub-tab" data-subtab="file">📄 Import File</button>
      </div>
      
      <!-- Folder import -->
      <div id="folder-content" class="sub-content active">
        <div class="section">
          <div class="section-title">Import Folder (Design System)</div>
          <div class="form-group">
            <label for="folder-input">Select folder with JSON files</label>
            <input id="folder-input" type="file" webkitdirectory directory multiple>
            <div class="example-path">Example: examples/design-system-1/</div>
          </div>
        </div>
      </div>
      
      <!-- File import -->
      <div id="file-content" class="sub-content">
        <div class="section">
          <div class="section-title">Import Single File</div>
          <div class="form-group">
            <label for="file-input">Choose JSON file</label>
            <input id="file-input" type="file" accept=".json">
            <div class="example-path">Example: examples/landing-page.json</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div id="settings-tab" class="main-tab-content">
      
      <!-- Logs Section -->
      <div class="section">
        <div class="section-title">📝 Logi</div>
        
        <div class="form-group">
          <button class="btn-secondary" id="export-logs">📤 Eksportuj Logi</button>
        </div>
      </div>
      
      <!-- Version Section -->
      <div class="version">Draftly v1.0.0</div>
    </div>
  </div>

  <div class="bottom-nav">
    <button class="nav-item active" data-tab="import">
      <div>📥</div>
      <div>Import</div>
    </button>
    <button class="nav-item" data-tab="settings">
      <div>⚙️</div>
      <div>Settings</div>
    </button>
  </div>

  <script>
    // Main navigation
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.main-tab-content');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab') + '-tab';
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    // Sub navigation for import
    const subTabs = document.querySelectorAll('.sub-tab');
    const subContents = document.querySelectorAll('.sub-content');
    
    subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const contentId = tab.getAttribute('data-subtab') + '-content';
        subTabs.forEach(t => t.classList.remove('active'));
        subContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(contentId).classList.add('active');
      });
    });
    
    // Folder import
    document.getElementById('folder-input').addEventListener('change', function(event) {
      const files = event.target.files;
      if (files.length > 0) {
        const folderData = {};
        let loadedFiles = 0;
        
        Array.from(files).forEach(file => {
          if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = function(e) {
              folderData[file.webkitRelativePath] = e.target.result;
              loadedFiles++;
              
              if (loadedFiles === Array.from(files).filter(f => f.name.endsWith('.json')).length) {
                parent.postMessage({ 
                  pluginMessage: { 
                    type: 'render-folder', 
                    data: folderData,
                    importType: 'design-system'
                  } 
                }, '*');
              }
            };
            reader.readAsText(file);
          }
        });
      }
    });
    
    // File import
    document.getElementById('file-input').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          parent.postMessage({ 
            pluginMessage: { 
              type: 'render-json', 
              data: content,
              importType: 'single-file'
            } 
          }, '*');
        };
        reader.readAsText(file);
      }
    });
    
    // Export logs handler
    document.getElementById('export-logs').addEventListener('click', function() {
      parent.postMessage({ 
        pluginMessage: { type: 'export-logs' } 
      }, '*');
    });
    
    // Listen for log export data
    window.addEventListener('message', function(event) {
      if (event.data.pluginMessage && event.data.pluginMessage.type === 'logs-export') {
        const { data, fileName } = event.data.pluginMessage;
        
        // Create download link
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  </script>
</body>
</html>`;

figma.showUI(uiHTML, { width: 400, height: 500 });
console.log('🎉DRAFTLY - Plugin initialized successfully!');