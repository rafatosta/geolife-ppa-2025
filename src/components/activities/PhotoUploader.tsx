import { Camera, ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../ui/IconButton';

interface Preview { file: File; url: string; }

export function PhotoUploader({ files, onChange, maxFiles = 8 }: { files: File[]; onChange: (files: File[]) => void; maxFiles?: number }) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files]);

  const add = (list: FileList | null) => {
    if (!list) return;
    onChange([...files, ...Array.from(list).filter((file) => file.type.startsWith('image/'))].slice(0, maxFiles));
  };

  return <div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => cameraRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-control border border-dashed border-primary/40 bg-primary-soft/45 text-sm font-semibold text-primary-dark"><Camera className="size-5" aria-hidden />Usar câmera</button><button type="button" onClick={() => galleryRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-control border border-dashed border-primary/40 bg-primary-soft/45 text-sm font-semibold text-primary-dark"><ImagePlus className="size-5" aria-hidden />Galeria</button></div><input ref={cameraRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => add(event.target.files)} /><input ref={galleryRef} className="sr-only" type="file" accept="image/*" multiple onChange={(event) => add(event.target.files)} />{previews.length > 0 && <><div className="mt-4 grid grid-cols-3 gap-2">{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.lastModified}`} className="group relative aspect-square overflow-hidden rounded-xl bg-surface-muted"><img className="size-full object-cover" src={url} alt={`Foto anexada ${index + 1}`} /><IconButton type="button" aria-label={`Remover foto ${index + 1}`} className="absolute right-1 top-1 size-8 bg-black/55 text-white hover:bg-black/70" onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}><X className="size-4" /></IconButton></div>)}</div><p className="mt-2 text-sm text-ink-secondary">{previews.length} {previews.length === 1 ? 'foto anexada' : 'fotos anexadas'}</p></>}</div>;
}
