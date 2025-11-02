import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Team Members', href: route('student-sport-teams.landing') },
  { title: 'View Member', href: '#' },
];

export default function View({
  assignment,
}: {
  assignment: {
    id: number;
    student?: { name?: string; email?: string };
    sportTeam?: { id?: number; name?: string; season?: string };
    position?: string;
    status?: string;
  };
}) {
  const student = assignment.student ?? {};
  const team = assignment.sportTeam ?? {};

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`View Team Member – ${student.name ?? 'Unknown'}`} />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
            Team Member Details
          </h1>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Student:</span>
              <span>{student.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Email:</span>
              <span>{student.email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Team:</span>
              <span>{team.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Season:</span>
              <span>{team.season ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Position:</span>
              <span>{assignment.position ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span className="capitalize">{assignment.status ?? '—'}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={route('student-sport-teams.index', team.id ?? 0)}
              className="inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Back to Team
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}