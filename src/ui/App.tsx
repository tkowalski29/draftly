import React, { useState } from 'react';
import './App.css';

type ImportType = 'design-system' | 'view';

function App() {
  const [importType, setImportType] = useState<ImportType>('design-system');
  console.log('🚀 App component is rendering!');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        parent.postMessage({ 
          pluginMessage: { 
            type: 'render-json', 
            data: content,
            importType: importType
          } 
        }, '*');
      };
      reader.readAsText(file);
    }
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const folderData: {[key: string]: string} = {};
      let filesProcessed = 0;
      
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          folderData[file.name] = content;
          filesProcessed++;
          
          if (filesProcessed === files.length) {
            parent.postMessage({ 
              pluginMessage: { 
                type: 'render-folder', 
                data: folderData,
                importType: importType
              } 
            }, '*');
          }
        };
        reader.readAsText(file);
      });
    }
  };

  return (
    <div className="container" style={{backgroundColor: 'white', padding: '15px'}}>
      <div style={{color: 'green', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px'}}>
        ✅ Draftly Plugin - Atomic Design System
      </div>
      <h2 style={{fontSize: '18px', marginBottom: '15px'}}>Import System</h2>
      
      {/* Import Type Selection */}
      <section style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px'}}>
        <label style={{display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold'}}>
          Typ importu:
        </label>
        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            onClick={() => setImportType('design-system')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: importType === 'design-system' ? '2px solid #007acc' : '1px solid #ccc',
              backgroundColor: importType === 'design-system' ? '#e7f3ff' : 'white',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🧩 Design System
          </button>
          <button 
            onClick={() => setImportType('view')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: importType === 'view' ? '2px solid #007acc' : '1px solid #ccc',
              backgroundColor: importType === 'view' ? '#e7f3ff' : 'white',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            📄 Widok/Strona
          </button>
        </div>
      </section>

      {/* Import Methods */}
      {importType === 'design-system' ? (
        <section style={{marginBottom: '15px'}}>
          <label htmlFor="folder-input" style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>
            📁 Wybierz folder z komponentami design systemu
          </label>
          <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
            Wybierz wszystkie pliki JSON z folderu design systemu (Ctrl+A po otwarciu folderu)
          </p>
          <input 
            id="folder-input" 
            type="file" 
            accept=".json" 
            multiple 
            onChange={handleFolderChange}
            style={{marginBottom: '10px'}}
          />
        </section>
      ) : (
        <section style={{marginBottom: '15px'}}>
          <label htmlFor="file-input" style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>
            📄 Wybierz plik widoku (landing page, shop cart itp.)
          </label>
          <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
            Pojedynczy plik JSON z kompletną stroną lub widokiem
          </p>
          <input id="file-input" type="file" accept=".json" onChange={handleFileChange} />
        </section>
      )}
      
      <div style={{fontSize: '12px', color: '#666', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
        Status: {importType === 'design-system' ? 
          'Gotowy do importu design systemu z folderu' : 
          'Gotowy do importu pojedynczego widoku'
        }
      </div>
    </div>
  );
}

export default App;
