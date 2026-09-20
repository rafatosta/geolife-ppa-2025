import { supabase } from '../lib/supabase';
import type { Submission } from '../types/domain';
import { storageService } from './storageService';

export const activityService = {
  async getDraft(occurrenceId: string): Promise<Submission | null> {
    const { data, error } = await supabase.from('submissions').select('*, photos:submission_photos(*)').eq('occurrence_id', occurrenceId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const submission = data as Submission;
    return {
      ...submission,
      photos: await Promise.all(submission.photos.map(async (photo) => ({ ...photo, signed_url: await storageService.signedUrl(photo.storage_path) }))),
    };
  },
  async save(occurrenceId: string, userId: string, note: string, files: File[], submit: boolean) {
    const { data, error } = await supabase.from('submissions').upsert({ occurrence_id: occurrenceId, user_id: userId, note, status: 'draft', submitted_at: null }, { onConflict: 'occurrence_id' }).select().single();
    if (error) throw error;
    const paths = files.length ? await storageService.uploadEvidence(userId, data.id, files) : [];
    if (paths.length) {
      const { error: photosError } = await supabase.from('submission_photos').insert(paths.map((storage_path) => ({ submission_id: data.id, storage_path })));
      if (photosError) throw photosError;
    }
    if (!submit) return data as Submission;
    const { data: submitted, error: submitError } = await supabase.from('submissions').update({ status: 'awaiting_confirmation', submitted_at: new Date().toISOString() }).eq('id', data.id).select().single();
    if (submitError) throw submitError;
    return submitted as Submission;
  },
  async deletePhoto(photoId: string, path: string) {
    await storageService.removeEvidence(path);
    const { error } = await supabase.from('submission_photos').delete().eq('id', photoId);
    if (error) throw error;
  },
};
