import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Section', href: '/sections' },
];

export default function Edit({ section }: { section: { id: number; code: string; program: string } }) {
    const { data, setData, errors, put } = useForm({
        code: section.code,
        program: section.program,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('sections.update', section.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Section" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">CRUD App</h1>

                    <Link
                        href={route('sections.index')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
                        <div className="grid gap-2">
                            <label htmlFor="code" className="text-sm font-medium">Section Code:</label>
                            <input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="mt-1 block w-full rounded-md border px-3 py-2"
                            />
                            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="program" className="text-sm font-medium">Program:</label>
                            <input
                                id="program"
                                value={data.program}
                                onChange={(e) => setData('program', e.target.value)}
                                className="mt-1 block w-full rounded-md border px-3 py-2"
                            />
                            {errors.program && <p className="text-sm text-red-500">{errors.program}</p>}
                        </div>

                        <button
                            type="submit"
                            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                        >
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}