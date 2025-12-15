import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import SelectInput from '@/components/FormInputs/SelectInput';
import RangeInput from '@/components/FormInputs/RangeInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle, faExclamationCircle, faTimesCircle, faBandAid } from '@fortawesome/free-solid-svg-icons';

interface Props {
  studentId?: number;
}

const NUTRITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent', description: 'Well balanced meals', icon: 'star' },
  { value: 'good', label: 'Good', description: 'Mostly healthy', icon: 'check-circle' },
  { value: 'fair', label: 'Fair', description: 'Some junk food', icon: 'exclamation-circle' },
  { value: 'poor', label: 'Poor', description: 'Mostly unhealthy', icon: 'times-circle' },
];

const INJURY_STATUS_OPTIONS = [
  { value: 'none', label: 'No Injury', description: 'Feeling great', icon: 'check-circle' },
  { value: 'minor', label: 'Minor', description: 'Soreness, stiffness', icon: 'band-aid' },
  { value: 'moderate', label: 'Moderate', description: 'Affects training', icon: 'exclamation-circle' },
  { value: 'severe', label: 'Severe', description: 'Cannot train', icon: 'times-circle' },
];

const SURVEY_STEPS = [
  { id: 1, title: 'Sleep', subtitle: 'How much did you sleep?' },
  { id: 2, title: 'Sleep Quality', subtitle: 'How was your sleep quality?' },
  { id: 3, title: 'Nutrition', subtitle: 'How was your nutrition?' },
  { id: 4, title: 'Hydration', subtitle: 'How hydrated are you?' },
  { id: 5, title: 'Mental Health', subtitle: 'How is your mood?' },
  { id: 6, title: 'Energy Level', subtitle: "What's your energy level?" },
  { id: 7, title: 'Recovery', subtitle: "How's your muscle soreness?" },
  { id: 8, title: 'Readiness', subtitle: 'Ready to train?' },
  { id: 9, title: 'Injury Status', subtitle: 'Any injuries?' },
  { id: 10, title: 'Notes', subtitle: 'Any additional notes?' },
];

export default function LogForm({ studentId }: Props) {
  const [formData, setFormData] = useState({
    sleep_hours: 8,
    sleep_quality: 7,
    nutrition_status: 'good',
    hydration_level: 7,
    injury_status: 'none',
    injury_severity: 0,
    mood: 7,
    energy_level: 7,
    recovery_soreness: 3,
    readiness_to_train: 7,
    notes: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < SURVEY_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wellness/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to log wellness data');
      }

      router.visit(route('dashboard'), { method: 'get' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        {(() => {
          switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
              Sleep Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleep_hours}
              onChange={(e) => handleChange('sleep_hours', parseFloat(e.target.value))}
              required
              className="w-full rounded-md border border-[#ccc] bg-white px-3 py-2 text-[#1b1b18] focus:ring-2 focus:ring-[#102d4e] focus:outline-none dark:border-[#444] dark:bg-[#0f0f0f] dark:text-[#EDEDEC]"
            />
          </div>
        );
      case 2:
        return (
          <RangeInput
            label="Sleep Quality"
            name="sleep_quality"
            value={formData.sleep_quality}
            onChange={(value) => handleChange('sleep_quality', value)}
            min={1}
            max={10}
            required
          />
        );
      case 3:
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
              Nutrition Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {NUTRITION_OPTIONS.map((option) => {
                const getIcon = (iconName: string) => {
                  const iconMap: Record<string, any> = {
                    'star': faStar,
                    'check-circle': faCheckCircle,
                    'exclamation-circle': faExclamationCircle,
                    'times-circle': faTimesCircle,
                  };
                  return iconMap[iconName];
                };
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('nutrition_status', option.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center gap-2 ${
                      formData.nutrition_status === option.value
                        ? 'border-[#102d4e] bg-[#102d4e] text-white dark:border-[#4a7ba7] dark:bg-[#4a7ba7]'
                        : 'border-[#e0e0e0] bg-[#fafafa] text-[#666] hover:border-[#102d4e] dark:border-[#444] dark:bg-[#2a2a2a] dark:text-[#aaa] dark:hover:border-[#4a7ba7]'
                    }`}
                  >
                    <FontAwesomeIcon icon={getIcon(option.icon)} size="lg" />
                    <div>
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 4:
        return (
          <RangeInput
            label="Hydration Level"
            name="hydration_level"
            value={formData.hydration_level}
            onChange={(value) => handleChange('hydration_level', value)}
            min={1}
            max={10}
          />
        );
      case 5:
        return (
          <RangeInput
            label="Mood"
            name="mood"
            value={formData.mood}
            onChange={(value) => handleChange('mood', value)}
            min={1}
            max={10}
            required
          />
        );
      case 6:
        return (
          <RangeInput
            label="Energy Level"
            name="energy_level"
            value={formData.energy_level}
            onChange={(value) => handleChange('energy_level', value)}
            min={1}
            max={10}
            required
          />
        );
      case 7:
        return (
          <RangeInput
            label="Recovery/Soreness"
            name="recovery_soreness"
            value={formData.recovery_soreness}
            onChange={(value) => handleChange('recovery_soreness', value)}
            min={1}
            max={10}
            required
          />
        );
      case 8:
        return (
          <RangeInput
            label="Readiness to Train"
            name="readiness_to_train"
            value={formData.readiness_to_train}
            onChange={(value) => handleChange('readiness_to_train', value)}
            min={1}
            max={10}
            required
          />
        );
      case 9:
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
              Injury Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {INJURY_STATUS_OPTIONS.map((option) => {
                const getIcon = (iconName: string) => {
                  const iconMap: Record<string, any> = {
                    'check-circle': faCheckCircle,
                    'band-aid': faBandAid,
                    'exclamation-circle': faExclamationCircle,
                    'times-circle': faTimesCircle,
                  };
                  return iconMap[iconName];
                };
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('injury_status', option.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col items-center gap-2 ${
                      formData.injury_status === option.value
                        ? 'border-[#102d4e] bg-[#102d4e] text-white dark:border-[#4a7ba7] dark:bg-[#4a7ba7]'
                        : 'border-[#e0e0e0] bg-[#fafafa] text-[#666] hover:border-[#102d4e] dark:border-[#444] dark:bg-[#2a2a2a] dark:text-[#aaa] dark:hover:border-[#4a7ba7]'
                    }`}
                  >
                    <FontAwesomeIcon icon={getIcon(option.icon)} size="lg" />
                    <div>
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {formData.injury_status !== 'none' && (
              <RangeInput
                label="Injury Severity"
                name="injury_severity"
                value={formData.injury_severity}
                onChange={(value) => handleChange('injury_severity', value)}
                min={1}
                max={10}
              />
            )}
          </div>
        );
      case 10:
        return (
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional observations or concerns..."
              rows={4}
              className="w-full rounded-md border border-[#ccc] bg-white px-3 py-2 text-[#1b1b18] focus:ring-2 focus:ring-[#102d4e] focus:outline-none dark:border-[#444] dark:bg-[#0f0f0f] dark:text-[#EDEDEC]"
            />
          </div>
        );
      default:
        return null;
          }
        })()}
      </div>
    );
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Log Wellness', href: '#' },
      ]}
    >
      <Head title="Log Wellness" />

      <div className="w-full p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">💪</span>
            <h1 className="text-3xl font-bold text-[#102d4e] dark:text-[#EDEDEC]">
              Daily Wellness Check-In
            </h1>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[#4a4a45] dark:text-[#bcbcb7]">
              Step {currentStep} of {SURVEY_STEPS.length}
            </p>
            <div className="flex gap-2 flex-wrap justify-end">
              {SURVEY_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep
                      ? 'w-6 bg-[#102d4e] dark:bg-[#4a7ba7]'
                      : 'w-2 bg-[#e0e0e0] dark:bg-[#444]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#eaeaea] dark:border-[#2a2a2a] p-8 shadow-sm min-h-96">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#102d4e] dark:text-[#EDEDEC] mb-2">
              {SURVEY_STEPS[currentStep - 1].title}
            </h2>
            <p className="text-[#666] dark:text-[#aaa]">
              {SURVEY_STEPS[currentStep - 1].subtitle}
            </p>
          </div>

          {renderStepContent()}

          {/* Recommendation Box */}
          <div className="mt-8 p-4 rounded-lg bg-[#fff8e1] dark:bg-[#2a2a1a] border border-[#f39c12] flex gap-3">
            <span className="text-xl">💡</span>
            <p className="text-sm text-[#856404] dark:text-[#d4a574]">
              Your wellness data helps your coach make better training decisions. Be honest!
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-8 border-t border-[#eaeaea] dark:border-[#2a2a2a]">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1 rounded-lg bg-[#666] px-4 py-3 font-semibold text-white transition hover:bg-[#555] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              type={currentStep === SURVEY_STEPS.length ? 'submit' : 'button'}
              onClick={currentStep === SURVEY_STEPS.length ? handleSubmit : handleNext}
              disabled={loading}
              className="flex-1 rounded-lg bg-[#102d4e] px-4 py-3 font-semibold text-white transition hover:bg-[#0d243d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : currentStep === SURVEY_STEPS.length ? '✓ Save' : 'Next →'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
