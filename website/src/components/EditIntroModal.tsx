import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  CvProfileState,
  DEFAULT_CV_PROFILE,
  IntroFormErrors,
  validateIntroFields,
} from '../utils/cvProfile';

interface EditIntroModalProps {
  isOpen: boolean;
  profile: CvProfileState;
  onSave: (updates: Pick<CvProfileState, 'fullName' | 'headline' | 'location' | 'availability' | 'introBio'>) => void;
  onClose: () => void;
}

export function EditIntroModal({ isOpen, profile, onSave, onClose }: EditIntroModalProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [availability, setAvailability] = useState(profile.availability);
  const [introBio, setIntroBio] = useState(profile.introBio);
  const [errors, setErrors] = useState<IntroFormErrors>({});

  useEffect(() => {
    if (isOpen) {
      setFullName(profile.fullName);
      setHeadline(profile.headline);
      setLocation(profile.location);
      setAvailability(profile.availability);
      setIntroBio(profile.introBio);
      setErrors({});
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const check = validateIntroFields({ fullName, headline, introBio });
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }

    onSave({
      fullName: fullName.trim(),
      headline: headline.trim(),
      location: location.trim() || DEFAULT_CV_PROFILE.location,
      availability: availability.trim() || DEFAULT_CV_PROFILE.availability,
      introBio: introBio.trim(),
    });
    onClose();
  };

  const handleReset = () => {
    setFullName(DEFAULT_CV_PROFILE.fullName);
    setHeadline(DEFAULT_CV_PROFILE.headline);
    setLocation(DEFAULT_CV_PROFILE.location);
    setAvailability(DEFAULT_CV_PROFILE.availability);
    setIntroBio(DEFAULT_CV_PROFILE.introBio);
    setErrors({});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-intro-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-200">
          <div className="space-y-1">
            <h2
              id="edit-intro-title"
              className="font-display text-xl font-bold tracking-tight text-zinc-950"
            >
              Edit Personal Introduction
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Replace the placeholder introduction details with your own text anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close introduction editor"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="intro-fullName" className="block text-xs font-medium text-zinc-800">
                Name
              </label>
              <input
                id="intro-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="intro-headline" className="block text-xs font-medium text-zinc-800">
                Role Headline
              </label>
              <input
                id="intro-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.headline && <p className="text-xs text-red-600">{errors.headline}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="intro-location" className="block text-xs font-medium text-zinc-800">
                Location
              </label>
              <input
                id="intro-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="intro-availability" className="block text-xs font-medium text-zinc-800">
                Availability
              </label>
              <input
                id="intro-availability"
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="intro-bio" className="block text-xs font-medium text-zinc-800">
              Short Introduction
            </label>
            <textarea
              id="intro-bio"
              rows={4}
              value={introBio}
              onChange={(e) => setIntroBio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600 leading-relaxed"
            />
            {errors.introBio && <p className="text-xs text-red-600">{errors.introBio}</p>}
          </div>

          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 rounded-lg"
            >
              Reset Placeholder
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Intro
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
