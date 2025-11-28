import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

export default function Index({
  sportTeam,
  assignments,
  sort,
}: {
  sportTeam: {
    id: number;
    name: string;
    season: string;
  };
  assignments: {
    id: number;
    student: { name: string };
    status: string;
    position: string;
  }[];
  sort?: string;
}) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function handleSortToggle() {
    const nextSort = sort === 'alpha' ? 'created' : 'alpha';
    router.get(
      route('student-sport-teams.index', sportTeam.id),
      { sort: nextSort },
      { preserveState: true }
    );
  }

  function confirmDelete(id: number) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (deleteId) {
      router.delete(route('student-sport-teams.destroy', deleteId));
      setDeleteId(null);
    }
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Team Members', href: route('student-sport-teams.landing') }]}>
      <Head title={`Team Members – ${sportTeam.name}`} />

      <div className="p-6">
        <div className="space-y-6">
          {/* Heading */}
          <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
            Team Members
          </h1>

          <div className="flex items-center justify-between gap-4">
            {can('student-sport-teams.create') && (
              <Link
                href={route('student-sport-teams.create', sportTeam.id)}
                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
              >
                Add Team Member
              </Link>
            )}
            <Link
              href={route('student-sport-teams.landing')}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Back
            </Link>
          </div>

          {assignments.length === 0 ? (
            <p className="text-muted-foreground">No team members assigned yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full font-sans text-sm text-gray-700">
                <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-1">
                        <span>Student</span>
                        <button
                          onClick={handleSortToggle}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">Position</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assignments.map((a) => (
                    <tr key={a.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{a.id}</td>
                      <td className="px-6 py-4">{a.student?.name}</td>
                      <td className="px-6 py-4">{a.position}</td>
                      <td className="px-6 py-4 capitalize">{a.status}</td>
                      <td className="space-x-2 px-6 py-4">
                        {can('student-sport-teams.edit') && (
                          <Link
                            href={route('student-sport-teams.edit', a.id)}
                            className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                          >
                            Edit
                          </Link>
                        )}
                        {can('student-sport-teams.view') && (
                          <Link
                            href={route('student-sport-teams.show', a.id)}
                            className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                          >
                            View
                          </Link>
                        )}
                        {can('student-sport-teams.delete') && (
                          <button
                            onClick={() => confirmDelete(a.id)}
                            className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="font-heading text-lg font-semibold text-[#102d4e] mb-2">
              Confirm Deletion
            </h2>
            <p className="font-sans text-sm text-gray-700 mb-4">
              Are you sure you want to delete this team member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 font-heading text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}