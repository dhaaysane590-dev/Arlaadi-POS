import React, { useState } from 'react';
import { phpMvcCodebase } from '../../data/phpMvcCode';
import { Code2, Database, Copy, Check, Download, Layers, ShieldCheck, Terminal } from 'lucide-react';

interface CodeExplorerViewProps {
  isDarkMode: boolean;
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ isDarkMode }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(phpMvcCodebase[0].path);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedFile = phpMvcCodebase.find(f => f.path === selectedFilePath) || phpMvcCodebase[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([selectedFile.code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.path.split('/').pop() || 'file.php';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-dark text-white rounded-3 shadow-sm">
            <Code2 className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">PHP 8+ MVC Code & Database Inspector</h1>
            <p className="text-muted small mb-0">Core PHP 8+ MVC Architecture, PDO Prepared Statements, SQL Schema, and REST API Gateway</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={handleCopy} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy File Code'}</span>
          </button>

          <button onClick={handleDownloadFile} className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 fw-semibold">
            <Download className="w-4 h-4" />
            <span>Download Source File</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        
        {/* Left Sidebar: PHP File Tree */}
        <div className="col-12 col-lg-4 col-xl-3">
          <div className={`card border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
            <h6 className="fw-bold small text-muted text-uppercase mb-3 d-flex align-items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Project Structure</span>
            </h6>

            <div className="list-group list-group-flush">
              {phpMvcCodebase.map((f) => {
                const isSelected = selectedFilePath === f.path;

                return (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFilePath(f.path)}
                    className={`list-group-item list-group-item-action border-0 rounded-2 py-2 px-2.5 mb-1 text-start transition-all ${
                      isSelected ? 'bg-primary text-white fw-bold shadow-sm' : 'hover-bg-light'
                    }`}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="font-monospace small text-truncate" style={{ maxWidth: '180px' }}>{f.path}</span>
                      <span className={`badge ${isSelected ? 'bg-white text-primary' : 'bg-light text-dark border'}`} style={{ fontSize: '0.65rem' }}>
                        {f.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Viewer: Code Syntax Panel */}
        <div className="col-12 col-lg-8 col-xl-9">
          <div className={`card border-0 shadow-sm rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
            
            {/* File Info Bar */}
            <div className="card-header bg-dark text-white p-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2 font-monospace">
                <Terminal className="w-4 h-4 text-warning" />
                <span className="fw-bold text-warning">{selectedFile.path}</span>
              </div>
              <span className="badge bg-secondary">{selectedFile.category}</span>
            </div>

            <div className="p-3 bg-light border-bottom text-muted small">
              <strong>Description:</strong> {selectedFile.description}
            </div>

            {/* Code Block Container */}
            <div className="p-3 bg-dark text-light overflow-x-auto" style={{ maxHeight: '550px' }}>
              <pre className="m-0 font-monospace" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                <code>{selectedFile.code}</code>
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
