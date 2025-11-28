import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Scholarships', href: '/scholarships' }];

interface ScholarshipSetting {
  id?: number;
  min_grade_percentage: string;
}

export default function Index({ setting }: { setting: ScholarshipSetting | null }) {
  const { data, setData, errors, post } = useForm<{ min_grade_percentage: string }>({
    min_grade_percentage: setting?.min_grade_percentage ?? '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route('scholarships.save'));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scholarship Settings" />
      <div className="p-6">
        <div className="space-y-6">
          {/* Heading */}
          <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
            Scholarship Settings
          </h1>

          <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
            <div className="grid gap-2">
              <label htmlFor="min_grade_percentage" className="font-heading font-medium text-sm text-[#102d4e]">
                Minimum Grade Percentage Required:
              </label>
              <input
                id="min_grade_percentage"
                type="number"
                step="0.01"
                value={data.min_grade_percentage}
                onChange={(e) => setData('min_grade_percentage', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                placeholder="Enter minimum grade percentage"
              />
              {errors.min_grade_percentage && (
                <p className="mt-1 text-sm text-red-500">{errors.min_grade_percentage}</p>
              )}
            </div>

            <button
              type="submit"
              className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}