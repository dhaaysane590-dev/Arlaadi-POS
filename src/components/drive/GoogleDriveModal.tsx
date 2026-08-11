import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  uploadToDrive,
  listDriveFiles,
  deleteDriveFile,
  DriveFileItem
} from '../../lib/drive';
import {
  HardDrive,
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportDataName?: string;
  exportDataContent?: string;
  isDarkMode?: boolean;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  exportDataName = 'Restaurant_Data_Backup.csv',
  exportDataContent = 'Date,Type,Details\n2026-08-09,Backup,Closed Dates and POS Days Data',
  isDarkMode = false
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupFileName, setBackupFileName] = useState<string>(exportDataName);

  useEffect(() => {
    setBackupFileName(exportDataName);
  }, [exportDataName]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        loadFiles();
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const fileList = await listDriveFiles();
      setFiles(fileList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMsg(null);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMsg({ type: 'success', text: `Signed in as ${res.user.email}` });
        const list = await listDriveFiles();
        setFiles(list);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to sign in with Google' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setFiles([]);
    setStatusMsg({ type: 'success', text: 'Signed out from Google' });
  };

  const handleUploadCurrentData = async () => {
    if (!accessToken) {
      setStatusMsg({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg(null);
      const res = await uploadToDrive(backupFileName, exportDataContent, 'text/csv');
      setStatusMsg({ type: 'success', text: `Uploaded "${res.name}" directly to Google Drive!` });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to upload file to Google Drive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (file: DriveFileItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}" from your Google Drive? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteDriveFile(file.id);
      setStatusMsg({ type: 'success', text: `Deleted "${file.name}" from Google Drive.` });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete file' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block bg-dark bg-opacity-60 z-3" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className={`modal-content border-0 shadow-lg rounded-4 overflow-hidden ${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
          
          <div className="modal-header bg-primary text-white p-3.5 border-0 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <HardDrive className="w-5 h-5 text-warning" />
              <h5 className="modal-title h6 fw-bold mb-0 text-white">Google Drive Cloud Backup & Sync</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            
            {/* Status Alert */}
            {statusMsg && (
              <div className={`alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-danger'} p-3 rounded-3 d-flex align-items-center gap-2 mb-3 text-xs fw-semibold`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* User Auth Banner */}
            {!currentUser ? (
              <div className="text-center py-4 bg-light rounded-4 border mb-4">
                <HardDrive className="w-12 h-12 text-primary mb-2 mx-auto" />
                <h6 className="fw-bold text-dark">Connect Your Google Drive</h6>
                <p className="text-muted small mb-3 max-w-md mx-auto">
                  Backup your Closed Dates, POS Days, Floor configurations, and sales reports directly to your personal Google Drive with end-to-end security.
                </p>

                {/* Official Sign in with Google Button Styling */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="btn btn-light border shadow-sm rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-bold text-dark hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-3 border mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={currentUser.photoURL || 'https://via.placeholder.com/40'}
                      alt="Avatar"
                      className="rounded-circle"
                      style={{ width: '38px', height: '38px' }}
                    />
                    <div>
                      <div className="fw-bold small text-dark">{currentUser.displayName || 'Google User'}</div>
                      <div className="text-muted text-xs">{currentUser.email}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={loadFiles}
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      title="Refresh files"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>

                {/* Upload Action Card */}
                <div className="p-3 bg-primary-subtle border border-primary-subtle rounded-3 mb-4">
                  <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-1.5">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Backup File to Google Drive</span>
                  </h6>

                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-8">
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace fw-semibold"
                        value={backupFileName}
                        onChange={(e) => setBackupFileName(e.target.value)}
                        placeholder="File name (e.g. Closed_Dates_2026.csv)"
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <button
                        onClick={handleUploadCurrentData}
                        disabled={loading}
                        className="btn btn-sm btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload to Drive</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* List Files in Google Drive */}
                <h6 className="fw-bold mb-2 small d-flex align-items-center justify-content-between">
                  <span>Your Drive Backups ({files.length})</span>
                  {loading && <span className="text-muted text-xs">Loading files...</span>}
                </h6>

                <div className="border rounded-3 overflow-hidden bg-white max-h-60 overflow-y-auto">
                  {files.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                      No backup files found in your Google Drive.
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {files.map(file => (
                        <div key={file.id} className="list-group-item d-flex align-items-center justify-content-between p-2.5">
                          <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="text-truncate">
                              <div className="fw-semibold text-xs text-dark text-truncate">{file.name}</div>
                              <div className="text-muted text-xxs">
                                {file.createdTime ? new Date(file.createdTime).toLocaleString() : ''}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-outline-primary p-1 rounded-2"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="btn btn-xs btn-outline-danger p-1 rounded-2"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          <div className="modal-footer bg-light p-3">
            <button type="button" className="btn btn-secondary btn-sm rounded-pill px-4" onClick={onClose}>
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
