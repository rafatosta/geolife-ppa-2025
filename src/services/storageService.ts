import { supabase } from '../lib/supabase';

const BUCKET = 'activity-evidence';

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1920;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar a imagem.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Não foi possível comprimir a imagem.')), 'image/webp', 0.82));
}

export const storageService = {
  async uploadEvidence(userId: string, submissionId: string, files: File[]) {
    const now = new Date();
    return Promise.all(files.map(async (file) => {
      const blob = await compressImage(file);
      const path = `${userId}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${submissionId}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', upsert: false });
      if (error) throw error;
      return path;
    }));
  },
  async signedUrl(path: string) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  },
  async removeEvidence(path: string) {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  },
};
