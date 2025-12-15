import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs = [{ title: 'Course Sections', href: '/course-sections' }];

export default function Index({
    courseSections,
    sort,
    courses = [],
    sections = [],
}: {
    courseSections: any[];
    sort: string;
    courses?: { id: number; title: string }[];
    sections?: { id: number; code: string }[];
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm<{
        course_id: number | '';
        section_id: number | '';
        term: string;
        units: number | '';
    }>({
        course_id: '',
        section_id: '',
        term: '',
        units: '',
    });

    const itemsPerPage = 9;
    const totalPages = Math.ceil(courseSections.length / itemsPerPage) || 1;
    const paginatedCourseSections = courseSections.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('course-sections.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    }

    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('course-sections.index'), { sort: nextSort }, { preserveState: true });
    }

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('course-sections.destroy', deleteId));
            setDeleteId(null);
        }
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Sections" />
            <div className="p-6">
                <div className="space-y-6">
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        Course Section Management
                    </h1>

                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {can('course-sections.create') && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add Course Section
                            </button>
                        )}

                        {/* Search Bar */}
                        {/* <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1); // reset to first page when searching
                            }}
                            placeholder="Search course section..."
                            className="w-64 rounded-md border border-gray-300 px-3 py-2 font-sans text-sm shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        /> */}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full font-sans text-sm text-gray-700">
                            <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">Course</th>
                                    <th className="px-6 py-4 text-left">Section</th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-1">
                                            <span>Term</span>
                                            <button
                                                onClick={handleSortToggle}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                            >
                                                <ArrowUpDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">Units</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedCourseSections.map((cs) => (
                                    <tr
                                        key={cs.id}
                                        className="transition hover:bg-[#0d243d] hover:text-white"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{cs.id}</td>
                                        <td className="px-6 py-4">{cs.course?.title}</td>
                                        <td className="px-6 py-4">{cs.section?.code}</td>
                                        <td className="px-6 py-4">{cs.term}</td>
                                        <td className="px-6 py-4">{cs.units}</td>
                                        <td className="px-6 py-4 capitalize">{cs.status}</td>
                                        <td className="space-x-2 px-6 py-4">
                                            {can('course-sections.edit') && (
                                                <Link
                                                    href={route('course-sections.edit', cs.id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('course-sections.view') && (
                                                <Link
                                                    href={route('course-sections.show', cs.id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('course-sections.delete') && (
                                                <button
                                                    onClick={() => confirmDelete(cs.id)}
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

                    {/* Pagination */}
                    {courseSections.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-sans text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="space-x-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm font-heading text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm font-heading text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
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
                            Are you sure you want to delete this course section? This action cannot be undone.
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-3 py-6 backdrop-blur-sm">
                    <FormModal
                        title="Add Course Section"
                        backHref={route('course-sections.index')}
                        backLabel="Close"
                        onBack={() => {
                            reset();
                            setShowModal(false);
                        }}
                    >
                        <form onSubmit={submit} className="space-y-5 font-sans">
                            <div className="grid gap-2">
                                <label htmlFor="course_id" className="font-heading text-sm text-[#102d4e]">
                                    Course:
                                </label>
                                <select
                                    id="course_id"
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value ? Number(e.target.value) : '')}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                >
                                    <option value="">Select course</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="section_id" className="font-heading text-sm text-[#102d4e]">
                                    Section:
                                </label>
                                <select
                                    id="section_id"
                                    value={data.section_id}
                                    onChange={(e) => setData('section_id', e.target.value ? Number(e.target.value) : '')}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                >
                                    <option value="">Select section</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.code}
                                        </option>
                                    ))}
                                </select>
                                {errors.section_id && <p className="mt-1 text-sm text-red-500">{errors.section_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="term" className="font-heading text-sm text-[#102d4e]">
                                    Term:
                                </label>
                                <input
                                    id="term"
                                    value={data.term}
                                    onChange={(e) => setData('term', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                    placeholder="e.g. 1st Term 2025–2026"
                                />
                                {errors.term && <p className="mt-1 text-sm text-red-500">{errors.term}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="units" className="font-heading text-sm text-[#102d4e]">
                                    Units:
                                </label>
                                <input
                                    id="units"
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={data.units}
                                    onChange={(e) => setData('units', e.target.value === '' ? '' : parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                    placeholder="e.g. 3"
                                />
                                {errors.units && <p className="mt-1 text-sm text-red-500">{errors.units}</p>}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        setShowModal(false);
                                    }}
                                    className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-70"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </FormModal>
                </div>
            )}
        </AppLayout>
    );
}