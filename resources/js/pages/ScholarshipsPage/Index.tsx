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
      <div className="p-3">
        <h1 className="mb-4 text-2xl font-bold">Scholarship Settings</h1>

        <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
          <div className="grid gap-2">
            <label htmlFor="min_grade_percentage" className="text-sm font-medium">
              Minimum Grade Percentage Required:
            </label>
            <input
              id="min_grade_percentage"
              type="number"
              step="0.01"
              value={data.min_grade_percentage}
              onChange={(e) => setData('min_grade_percentage', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter minimum grade percentage"
            />
            {errors.min_grade_percentage && (
              <p className="mt-1 text-sm text-red-500">{errors.min_grade_percentage}</p>
            )}
          </div>

          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
          >
            Save
          </button>
        </form>
      </div>
    </AppLayout>
  );
}