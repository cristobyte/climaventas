'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '@/lib/api';
import { FileText, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PdfUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function PdfUpload({ value, onChange, disabled }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadQuotation,
    onSuccess: (data) => {
      onChange(data.url);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al subir el archivo');
      setFileName(null);
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('El archivo no puede superar los 10MB');
        return;
      }

      setFileName(file.name);
      uploadMutation.mutate(file);
    },
    [uploadMutation]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || uploadMutation.isPending) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, uploadMutation.isPending, handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    if (!disabled && !uploadMutation.isPending) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onChange('');
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If there's an uploaded file URL
  if (value) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {fileName || 'Cotización subida'}
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Ver documento
              </a>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${disabled || uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 dark:border-red-600' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          disabled={disabled || uploadMutation.isPending}
          className="hidden"
        />

        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Subiendo {fileName}...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Arrastra un PDF aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Solo archivos PDF, máximo 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
