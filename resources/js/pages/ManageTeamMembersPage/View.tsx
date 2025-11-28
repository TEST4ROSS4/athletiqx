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
      <div className="p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Heading */}
          <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
            Team Member Details
          </h1>

          {/* Back Button */}
          <Link
            href={route('student-sport-teams.index', team.id ?? 0)}
            className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
          >
            Back
          </Link>

          {/* Manage Team Member Info Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
            <div>
              <p className="text-sm font-heading text-[#102d4e]">Student:</p>
              <p className="text-base font-sans text-gray-800">{student.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-heading text-[#102d4e]">Email:</p>
              <p className="text-base font-sans text-gray-800">{student.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-heading text-[#102d4e]">Team:</p>
              <p className="text-base font-sans text-gray-800">{team.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-heading text-[#102d4e]">Season:</p>
              <p className="text-base font-sans text-gray-800">{team.season ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-heading text-[#102d4e]">Position:</p>
              <p className="text-base font-sans text-gray-800">{assignment.position ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-heading text-[#102d4e]">Status:</p>
              <p className="text-base font-sans text-gray-800 capitalize">{assignment.status ?? '—'}</p>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}