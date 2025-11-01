import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

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
  function handleSortToggle() {
    const nextSort = sort === 'alpha' ? 'created' : 'alpha';
    router.get(
      route('student-sport-teams.index', sportTeam.id),
      { sort: nextSort },
      { preserveState: true }
    );
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to remove this team member?')) {
      router.delete(route('student-sport-teams.destroy', id));
    }
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Team Members', href: route('student-sport-teams.landing') }]}>
      <Head title={`Team Members – ${sportTeam.name}`} />

      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          {can('student-sport-teams.create') && (
            <Link
              href={route('student-sport-teams.create', sportTeam.id)}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">
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
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-2 font-medium">{a.id}</td>
                    <td className="px-6 py-2">{a.student?.name}</td>
                    <td className="px-6 py-2">{a.position}</td>
                    <td className="px-6 py-2 capitalize">{a.status}</td>
                    <td className="space-x-1 px-6 py-2">
                      {can('student-sport-teams.edit') && (
                        <Link
                          href={route('student-sport-teams.edit', a.id)}
                          className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                        >
                          Edit
                        </Link>
                      )}
                      {can('student-sport-teams.view') && (
                        <Link
                          href={route('student-sport-teams.show', a.id)}
                          className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                        >
                          View
                        </Link>
                      )}
                      {can('student-sport-teams.delete') && (
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded bg-red-700 px-3 py-2 text-xs text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none"
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
    </AppLayout>
  );
}