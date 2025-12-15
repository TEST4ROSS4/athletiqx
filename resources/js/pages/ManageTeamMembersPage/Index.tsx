import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowUpDown, PlusCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useMemo, useState, type FormEvent } from 'react';

export default function Index({
  sportTeam,
  assignments,
  students = [],
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
  students?: { id: number; name: string }[];
  sort?: string;
}) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const statusOptions = useMemo(
    () => ['tryout', 'active', 'injured', 'inactive', 'redshirt', 'suspended'],
    [],
  );

  const { data, setData, post, processing, reset } = useForm({
    members: [{ student_id: null as number | null, position: '', status: '' }],
  });

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    post(route('student-sport-teams.store', sportTeam.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setShowAddModal(false);
      },
    });
  }

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
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Team Members
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1 text-foreground/80 shadow-sm">
                Season: {sportTeam.season}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {can('student-sport-teams.create') && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/60"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Team Member
                </button>
              )}
              <Link
                href={route('student-sport-teams.landing')}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-border"
              >
                Back
              </Link>
            </div>
          </div>

          {assignments.length === 0 ? (
            <p className="text-muted-foreground">No team members assigned yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border shadow-sm bg-card">
              <table className="w-full font-sans text-sm text-foreground">
                <thead className="bg-muted font-heading text-xs uppercase text-foreground/90">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-1">
                        <span>Student</span>
                        <button
                          onClick={handleSortToggle}
                          className="text-muted-foreground hover:text-foreground focus:outline-none"
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
                <tbody className="divide-y divide-border bg-card">
                  {assignments.map((a) => (
                    <tr key={a.id} className="transition hover:bg-muted/60">
                      <td className="px-6 py-4 font-medium text-foreground">{a.id}</td>
                      <td className="px-6 py-4">{a.student?.name}</td>
                      <td className="px-6 py-4">{a.position}</td>
                      <td className="px-6 py-4 capitalize">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          {a.status}
                        </span>
                      </td>
                      <td className="space-x-2 px-6 py-4">
                        {can('student-sport-teams.edit') && (
                          <Link
                            href={route('student-sport-teams.edit', a.id)}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 font-heading text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/60 focus:outline-none"
                          >
                            Edit
                          </Link>
                        )}
                        {can('student-sport-teams.view') && (
                          <Link
                            href={route('student-sport-teams.show', a.id)}
                            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                          >
                            View
                          </Link>
                        )}
                        {can('student-sport-teams.delete') && (
                          <button
                            onClick={() => confirmDelete(a.id)}
                            className="inline-flex items-center rounded-md bg-destructive px-3 py-1.5 font-heading text-xs font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/60 focus:outline-none"
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">Add Team Member</h2>
                <p className="text-sm text-muted-foreground">
                  Assign a student to <span className="font-semibold">{sportTeam.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground focus:outline-none"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">Student</label>
                <select
                  value={data.members[0].student_id ?? ''}
                  onChange={(e) =>
                    setData('members', [
                      {
                        ...data.members[0],
                        student_id: e.target.value ? Number(e.target.value) : null,
                      },
                    ])
                  }
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">Position</label>
                <input
                  type="text"
                  value={data.members[0].position}
                  onChange={(e) =>
                    setData('members', [{ ...data.members[0], position: e.target.value }])
                  }
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., Forward"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <select
                  value={data.members[0].status}
                  onChange={(e) =>
                    setData('members', [{ ...data.members[0], status: e.target.value }])
                  }
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowAddModal(false);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !data.members[0].student_id || !data.members[0].position || !data.members[0].status}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-60"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg border border-border">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-2">
              Confirm Deletion
            </h2>
            <p className="font-sans text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this team member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-border px-4 py-2 font-heading text-sm text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-border"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-destructive px-4 py-2 font-heading text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive/60"
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