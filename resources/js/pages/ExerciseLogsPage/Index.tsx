import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { Menu } from '@headlessui/react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface ExerciseLog {
    id: number;
    exercise: string;
    sets_count: number;
    notes: string;
    student_name: string;
    assigned_by?: string;
    status: 'assigned' | 'in-progress' | 'completed'; // New status field
    created_at: string;
    updated_at: string;
}

interface Props {
    exerciseLogs: {
        data: ExerciseLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        search?: string;
        sort?: string;
    };
    currentUserRole: string;
    studentId?: number; // Optional studentId if filtering for a student
}

export default function Index({ exerciseLogs, filters, currentUserRole, studentId }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('exercise-logs.index', { studentId }),
                { ...filters, search, page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, studentId]);

    function handleSortToggle() {
        const nextSort =
            filters.sort === 'date'
                ? 'latest'
                : filters.sort === 'exercise'
                  ? 'date'
                  : 'exercise';

        router.get(
            route('exercise-logs.index', { studentId }),
            { ...filters, search, sort: nextSort },
            { preserveState: true },
        );
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this exercise log?')) {
            router.delete(route('exercise-logs.destroy', id));
        }
    }

    // Utility function to display status text based on exercise log status
    function getStatusText(status: 'assigned' | 'in-progress' | 'completed') {
        switch (status) {
            case 'assigned':
                return 'Assigned';
            case 'in-progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return 'Unknown';
        }
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Exercise Logs', href: route('exercise-logs.index') },
            ]}
        >
            <Head title="All Exercise Logs" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:justify-start">
                        <div className="flex flex-wrap gap-2">
                            {can('exercise-logs.create') && (
                                <Link href={route('exercise-logs.create')}>
                                    <Button className="flex items-center gap-2">
                                        Add Exercise Log
                                    </Button>
                                </Link>
                            )}
                            <Link href={route('exercise-logs.index')}>
                                <Button variant="secondary">Back</Button>
                            </Link>
                        </div>

                        {/* Live Search */}
                        <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:ml-auto">
                            <input
                                type="text"
                                placeholder="Search exercise logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-1 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sort */}
                <div className="mt-2 flex justify-end sm:mt-4">
                    <Button
                        variant="outline"
                        onClick={handleSortToggle}
                        className="flex items-center gap-2"
                    >
                        <ArrowUpDown size={16} />
                        Sort: {filters.sort === 'date' ? 'Latest' : filters.sort === 'exercise' ? 'Exercise' : 'Date'}
                    </Button>
                </div>

                {/* Exercise Logs Grid */}
                {exerciseLogs.data.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        You haven’t logged any exercises yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {exerciseLogs.data.map((log) => (
                            <div
                                key={log.id}
                                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow transition-all duration-200 hover:shadow-lg"
                            >
                                {/* Kebab Menu */}
                                <div className="mt-0 flex justify-end">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 p-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                            <MoreVertical size={16} />
                                        </Menu.Button>

                                        <Menu.Items className="ring-opacity-5 absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
                                            <div className="py-1">
                                                {/* View */}
                                                {can('exercise-logs.view') && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                href={route('exercise-logs.show', log.id)}
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
                                                {can('exercise-logs.edit') && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                href={route('exercise-logs.edit', log.id)}
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
                                                {can('exercise-logs.delete') && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleDelete(log.id)}
                                                                className={`${
                                                                    active ? 'bg-gray-100' : ''
                                                                } block w-full px-4 py-2 text-left text-sm text-red-600`}
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
                                    <h2 className="truncate text-lg font-bold text-gray-900">
                                        {log.exercise}
                                    </h2>
                                    <p className="line-clamp-2 text-sm text-gray-500">
                                        {log.notes}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                        {log.sets_count}{' '}
                                        {log.sets_count === 1 ? 'Set' : 'Sets'}
                                    </span>
                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                                        {log.student_name}
                                    </span>
                                    <span
                                        className={`${
                                            log.status === 'assigned'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : log.status === 'in-progress'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                        } rounded-full px-2 py-1 text-xs font-semibold`}
                                    >
                                        {getStatusText(log.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-6 flex justify-between">
                    {exerciseLogs.prev_page_url && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                exerciseLogs.prev_page_url &&
                                router.get(exerciseLogs.prev_page_url, {
                                    preserveState: true,
                                })
                            }
                        >
                            Previous
                        </Button>
                    )}
                    {exerciseLogs.next_page_url && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                exerciseLogs.next_page_url &&
                                router.get(exerciseLogs.next_page_url, {
                                    preserveState: true,
                                })
                            }
                        >
                            Next
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
