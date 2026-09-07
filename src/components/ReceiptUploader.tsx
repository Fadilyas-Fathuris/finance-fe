import React, { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { uploadReceipt } from '../supabase';

type ReceiptUploaderProps = {
  onUploadSuccess: (url: string) => void;
  onClear: () => void;
  value?: string;
};

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  onUploadSuccess,
  onClear,
  value,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG/JPEG)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadReceipt(file);
      onUploadSuccess(url);
    } catch (err: any) {
      console.error(err);
      setError('Gagal mengunggah gambar bukti pembayaran');
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
      />

      {value ? (
        <div className="relative border-4 border-black dark:border-white p-2 bg-white dark:bg-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
          <div className="h-48 w-full overflow-hidden border-2 border-black flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <img src={value} alt="Bukti Pembayaran" className="h-full w-full object-contain" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-black uppercase font-mono">
              <Check size={14} strokeWidth={3} /> Bukti Terunggah
            </div>
            <button
              type="button"
              onClick={onClear}
              className="bg-red-100 hover:bg-red-200 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-2 border-black p-1 text-xs font-bold transition-all active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
            >
              <X size={12} strokeWidth={3} /> Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-4 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
              : 'border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-purple-600 dark:text-purple-400 rounded-full" />
              <p className="text-xs font-black uppercase font-mono text-gray-500">Mengunggah Bukti...</p>
            </div>
          ) : (
            <>
              <Upload className="mb-2 text-black dark:text-white" size={24} />
              <p className="text-xs font-black uppercase text-black dark:text-white font-mono">
                Seret & Lepas Gambar Bukti
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                Atau klik untuk memilih file (PNG, JPEG)
              </p>
            </>
          )}

          {error && (
            <p className="text-[10px] text-red-500 font-bold mt-2 uppercase font-mono">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
