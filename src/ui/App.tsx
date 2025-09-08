import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  console.log('🚀 App component is rendering!');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        parent.postMessage({ pluginMessage: { type: 'render-json', data: content } }, '*');
      };
      reader.readAsText(file);
    }
  };

  const handleRenderFromUrl = () => {
    if (url) {
      parent.postMessage({ pluginMessage: { type: 'render-url', data: url } }, '*');
    }
  };

  return (
    <div className="container" style={{backgroundColor: 'white', padding: '15px'}}>
      <div style={{color: 'green', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px'}}>
        ✅ Plugin działa! Wersja uproszczona.
      </div>
      <h2 style={{fontSize: '18px', marginBottom: '15px'}}>JSON to Figma Renderer</h2>
      
      <section style={{marginBottom: '15px'}}>
        <label htmlFor="file-input" style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>
          Wybierz plik JSON z dysku
        </label>
        <input id="file-input" type="file" accept=".json" onChange={handleFileChange} />
      </section>

      <div style={{textAlign: 'center', margin: '15px 0', color: '#999', fontSize: '14px'}}>LUB</div>

      <section style={{marginBottom: '15px'}}>
        <label htmlFor="url-input" style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>
          Podaj URL do pliku JSON
        </label>
        <input 
          id="url-input" 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://..." 
          style={{width: '100%', marginBottom: '10px'}}
        />
        <button onClick={handleRenderFromUrl} style={{width: '100%'}}>
          Renderuj z URL
        </button>
      </section>
      
      <div style={{fontSize: '12px', color: '#666', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
        Status: Plugin gotowy do użycia
      </div>
    </div>
  );
}

export default App;
