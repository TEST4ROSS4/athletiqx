import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Eye, Pencil, Trash2, Users, MoreVertical } from 'lucide-react';
import { Menu } from '@headlessui/react';
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
    }, 300);

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
                    Create Program
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

        {/* Programs Grid */}
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
                {/* Kebab Menu */}
                <div className="mt-0 flex justify-end">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 p-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                      <MoreVertical size={16} />
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        {/* Assign/Edit Assign */}
                        {program.assignments_count > 0
                          ? can('programs.assignments.edit') && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href={route('programs.assignments.edit', program.id)}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } block px-4 py-2 text-sm text-gray-700`}
                                  >
                                    Edit Assign
                                  </Link>
                                )}
                              </Menu.Item>
                            )
                          : can('programs.assignments.create') && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href={route('programs.assignments.create', program.id)}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } block px-4 py-2 text-sm text-gray-700`}
                                  >
                                    Assign
                                  </Link>
                                )}
                              </Menu.Item>
                            )}

                        {/* View */}
                        {can('programs.view') && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={route('programs.show', program.id)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block px-4 py-2 text-sm text-gray-700`}
                              >
                                View
                              </Link>
                            )}
                          </Menu.Item>
                        )}

                        {/* Edit */}
                        {can('programs.edit') && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={route('programs.edit', program.id)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block px-4 py-2 text-sm text-gray-700`}
                              >
                                Edit
                              </Link>
                            )}
                          </Menu.Item>
                        )}

                        {/* Delete */}
                        {can('programs.delete') && (
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDelete(program.id)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block w-full text-left px-4 py-2 text-sm text-red-600`}
                              >
                                Delete
                              </button>
                            )}
                          </Menu.Item>
                        )}
                      </div>
                    </Menu.Items>
                  </Menu>
                </div>
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

              </div>
            ))}
          </div>
        )}

        {/* Pagination ... keep same as before */}
      </div>
    </AppLayout>
  );
}
