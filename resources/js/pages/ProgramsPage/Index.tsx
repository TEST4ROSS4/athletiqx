import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Eye, Pencil, PlusCircle, Trash2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';

interface Program {
  id: number;
  name: string;
  note?: string;
  exercises_count: number;
  assignments_count: number;
}

interface Props {
  programs: {
    data: Program[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  filters: {
    search?: string;
    status?: string;
    sort?: string;
  };
}

export default function Index({ programs, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  // Trigger search automatically on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route('programs.index'),
        { ...filters, search, page: 1 },
        { preserveState: true, replace: true }
      );
    }, 300); // small debounce to avoid too many requests

    return () => clearTimeout(timeout);
  }, [search]);

  function handleSortToggle() {
    const nextSort =
      filters.sort === 'name'
        ? 'latest'
        : filters.sort === 'exercises'
        ? 'name'
        : 'exercises';

    router.get(route('programs.index'), { ...filters, search, sort: nextSort }, { preserveState: true });
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this program?')) {
      router.delete(route('programs.destroy', id));
    }
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Training Programs', href: route('programs.landing') }]}>
      <Head title="All Training Programs" />

      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:justify-start">
            <div className="flex flex-wrap gap-2">
              {can('programs.create') && (
                <Link href={route('programs.create')}>
                  <Button className="flex items-center gap-2">
                    <PlusCircle size={18} /> Create Program
                  </Button>
                </Link>
              )}
              <Link href={route('programs.landing')}>
                <Button variant="secondary">Back</Button>
              </Link>
            </div>

            {/* Live Search */}
            <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:ml-auto">
              <input
                type="text"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="mt-2 sm:mt-4 flex justify-end">
          <Button variant="outline" onClick={handleSortToggle} className="flex items-center gap-2">
            <ArrowUpDown size={16} />
            Sort:{' '}
            {filters.sort === 'name'
              ? 'A–Z'
              : filters.sort === 'exercises'
              ? 'Exercises'
              : 'Latest'}
          </Button>
        </div>

        {/* No Programs */}
        {programs.data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            You haven’t created any programs yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {programs.data.map((program) => (
              <div
                key={program.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="truncate text-lg font-bold text-gray-900">{program.name}</h2>
                  {program.note && (
                    <p className="line-clamp-2 text-sm text-gray-500">{program.note}</p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                    {program.exercises_count} {program.exercises_count === 1 ? 'Exercise' : 'Exercises'}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    program.assignments_count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {program.assignments_count > 0
                      ? `${program.assignments_count} Assigned`
                      : 'Unassigned'}
                  </span>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {can('programs.assign') && (
                    <Link href={route('programs.index', { assign: program.id })}>
                      <Button variant="outline" size="sm" className="p-2"><Users size={16} /></Button>
                    </Link>
                  )}
                  {can('programs.edit') && (
                    <Link href={route('programs.edit', program.id)}>
                      <Button variant="outline" size="sm" className="p-2"><Pencil size={16} /></Button>
                    </Link>
                  )}
                  {can('programs.view') && (
                    <Link href={route('programs.show', program.id)}>
                      <Button variant="outline" size="sm" className="p-2"><Eye size={16} /></Button>
                    </Link>
                  )}
                  {can('programs.delete') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                      className="p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {programs.total > programs.per_page && (
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center flex-wrap justify-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={!programs.prev_page_url}
                onClick={() =>
                  programs.prev_page_url &&
                  router.get(programs.prev_page_url, {}, { preserveState: true })
                }
                className="flex items-center gap-1"
              >
                ← Prev
              </Button>

              {/* Page Numbers */}
              {Array.from({ length: programs.last_page }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === programs.last_page ||
                    Math.abs(page - programs.current_page) <= 2
                )
                .map((page, i, arr) => {
                  const prev = arr[i - 1];
                  const isActive = page === programs.current_page;
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 text-gray-400">…</span>}
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 rounded-full ${
                          isActive
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() =>
                          router.get(route('programs.index'), { ...filters, page }, { preserveState: true })
                        }
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={!programs.next_page_url}
                onClick={() =>
                  programs.next_page_url &&
                  router.get(programs.next_page_url, {}, { preserveState: true })
                }
                className="flex items-center gap-1"
              >
                Next →
              </Button>
            </div>

            {/* Page Info */}
            <p className="text-xs text-gray-500">
              Showing {(programs.current_page - 1) * programs.per_page + 1}–
              {Math.min(programs.current_page * programs.per_page, programs.total)} of {programs.total}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
