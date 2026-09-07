import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
const bucketName = (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'receipts';

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function uploadReceipt(file: File): Promise<string> {
  const getBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file as base64'));
      };
      reader.readAsDataURL(file);
    });
  };

  if (!isConfigured || !supabase) {
    console.warn('Supabase is not configured. Falling back to local base64 Data URL for receipt image.');
    return getBase64();
  }

  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Supabase upload failed, auto-falling back to base64 encoding to prevent disruption:', err);
    // Automatic fallback to base64 if Supabase is down, quota is exceeded, etc.
    return getBase64();
  }
}
