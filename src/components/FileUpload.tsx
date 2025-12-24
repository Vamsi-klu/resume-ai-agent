'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthProvider';

interface UploadedFile {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    hasExtractedText: boolean;
}

interface FileUploadProps {
    onFilesUploaded: (files: UploadedFile[], extractedText: string | null) => void;
    maxFiles?: number;
}

export default function FileUpload({ onFilesUploaded, maxFiles = 6 }: FileUploadProps) {
    const { token } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        await uploadFiles(files);
    }, [token]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await uploadFiles(files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [token]);

    const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return;
        if (files.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadedFiles(data.files);
            onFilesUploaded(data.files, data.extractedText);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('image')) return '🖼️';
        return '📁';
    };

    return (
        <div className="animate-fade-in">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Uploading files...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>
                            Drop your resume here
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                            or click to browse
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                            PDF, Word documents, or up to {maxFiles} images (PNG, JPG)
                        </p>
                    </>
                )}
            </div>

            {error && (
                <div style={{
                    marginTop: 16,
                    padding: 12,
                    background: 'rgba(239,68,68,0.1)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-error)',
                    fontSize: 14,
                }}>
                    {error}
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                        Uploaded Files
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {uploadedFiles.map(file => (
                            <div
                                key={file.id}
                                className="card animate-slide-up"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 12,
                                }}
                            >
                                <span style={{ fontSize: 24 }}>{getFileIcon(file.fileType)}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {file.fileName}
                                    </p>
                                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                        {formatFileSize(file.fileSize)}
                                    </p>
                                </div>
                                {file.hasExtractedText && (
                                    <span className="badge badge-success">Text Extracted</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
