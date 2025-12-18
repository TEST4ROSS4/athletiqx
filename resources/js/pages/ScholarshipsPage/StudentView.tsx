import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Scholarship Status', href: '/scholarships' }];

interface Enrollment {
  id: number;
  course: { title: string; code: string };
  section: { code: string };
  units: number;
  final_grade: number | null;
  eligible: boolean;
}

export default function StudentView({
  minGrade,
  studentName,
  gwa,
  overallEligible,
  enrollments = [],
}: {
  minGrade: number;
  studentName: string;
  gwa: string | number;
  overallEligible: boolean;
  enrollments?: Enrollment[];
}) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scholarship Status" />
      <div className="p-6 text-gray-900 dark:text-slate-100">
        <h1 className="mb-4 text-2xl font-bold text-[#102d4e] dark:text-slate-100">Scholarship Status</h1>

        {/* Top Info */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-sm text-gray-600 dark:text-slate-200">
            Student: <span className="font-semibold">{studentName}</span>
          </p>
          <p className="mb-2 text-sm text-gray-600 dark:text-slate-200">
            Minimum Required Grade: <span className="font-semibold">{minGrade}%</span>
          </p>
          <p className="mb-2 text-sm text-gray-600 dark:text-slate-200">
            General Weighted Average (GWA): <span className="font-semibold">{gwa}</span>
          </p>
          <p className="mb-2 text-sm text-gray-600 dark:text-slate-200">
            Overall Scholarship Eligibility:{' '}
            {overallEligible ? (
              <span className="font-semibold text-green-700 dark:text-green-200">✅ Eligible</span>
            ) : (
              <span className="font-semibold text-red-700 dark:text-red-200">❌ Not Eligible</span>
            )}
          </p>
        </div>

        {/* Enrolled Subjects */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm text-gray-700 dark:text-slate-100">
            <thead className="bg-gray-50 text-xs uppercase dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Course Code</th>
                <th className="px-6 py-3">Section</th>
                <th className="px-6 py-3">Units</th>
                <th className="px-6 py-3">Final Grade (%)</th>
                <th className="px-6 py-3">Eligible?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-gray-100 odd:bg-white even:bg-gray-50 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-950">
                  <td className="px-6 py-2 font-medium">{enrollment.course.title}</td>
                  <td className="px-6 py-2">{enrollment.course.code}</td>
                  <td className="px-6 py-2">{enrollment.section.code}</td>
                  <td className="px-6 py-2">{enrollment.units}</td>
                  <td className="px-6 py-2">{enrollment.final_grade ?? '—'}</td>
                  <td className="px-6 py-2">
                    {enrollment.eligible ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-200">Yes</span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-200">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}