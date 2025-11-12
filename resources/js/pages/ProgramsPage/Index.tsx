import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Eye, Pencil, PlusCircle, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
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
    links?: any;
    meta?: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
  filters: {
    search?: string;
    status?: string;
    sort?: string;
  };
}

export default function Index({ programs: rawPrograms, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  // Safe defaults to prevent undefined errors
  const programs = rawPrograms || { data: [], meta: { total: 0, per_page: 12, current_page: 1, last_page: 1 } };
  const meta = programs.meta || { total: 0, per_page: 12, current_page: 1, last_page: 1 };

  function handleSortToggle() {
    const nextSort =
      filters.sort === 'name'
        ? 'latest'
        : filters.sort === 'exercises'
        ? 'name'
        : 'exercises';

    router.get(
      route('programs.index'),
      { ...filters, search, sort: nextSort },
      { preserveState: true }
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      route('programs.index'),
      { ...filters, search },
      { preserveState: true }
    );
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this program?')) {
      router.delete(route('programs.destroy', id));
    }
  }

  function goToPage(page: number) {
    router.get(
      route('programs.index'),
      { ...filters, search, page },
      { preserveState: true }
    );
  }

  return (
    <AppLayout
      breadcrumbs={[{ title: 'Training Programs', href: route('programs.landing') }]}
    >
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

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mt-2 flex items-center gap-2 sm:mt-0 sm:ml-auto"
            >
              <input
                type="text"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Sort */}
        <div className="mt-2 sm:mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={handleSortToggle}
            className="flex items-center gap-2"
          >
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
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      program.assignments_count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {program.assignments_count > 0
                      ? `${program.assignments_count} Assigned`
                      : 'Unassigned'}
                  </span>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {can('programs.assign') && (
                    <Link href={route('programs.index', { assign: program.id })}>
                      <Button variant="outline" size="sm" className="p-2">
                        <Users size={16} />
                      </Button>
                    </Link>
                  )}

                  {can('programs.edit') && (
                    <Link href={route('programs.edit', program.id)}>
                      <Button variant="outline" size="sm" className="p-2">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                  )}

                  {can('programs.view') && (
                    <Link href={route('programs.show', program.id)}>
                      <Button variant="outline" size="sm" className="p-2">
                        <Eye size={16} />
                      </Button>
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
{programs.meta?.total && programs.meta.total > programs.meta.per_page && (
  <div className="mt-6 flex justify-center items-center gap-4 text-sm text-muted-foreground">
    {/* Previous Button */}
    <Button
      disabled={!programs.links.prev}
      onClick={() => programs.links.prev && router.get(programs.links.prev, {}, { preserveState: true })}
      size="sm"
    >
      Previous
    </Button>

    {/* Page Info */}
    <span>
      Page {programs.meta.current_page} of {programs.meta.last_page}
    </span>

    {/* Next Button */}
    <Button
      disabled={!programs.links.next}
      onClick={() => programs.links.next && router.get(programs.links.next, {}, { preserveState: true })}
      size="sm"
    >
      Next
    </Button>
  </div>
)}

      </div>
    </AppLayout>
  );
}
