import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Create() {
    const { data, setData, errors, post } = useForm<{
        code: string;
        title: string;
    }>({
        code: '',
        title: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('courses.store'));
    }

    return (
        <AppLayout>
            <Head title="Add Course" />
            <FormModal title="Add Course" backHref={route('courses.index')}>
                <form onSubmit={submit} className="space-y-6 font-sans">
                    <div className="grid gap-2">
                        <label
                            htmlFor="code"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Course Code:
                        </label>
                        <input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            name="code"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter course code"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.code}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="title"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Course Title:
                        </label>
                        <input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            name="title"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter course title"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Submit
                    </button>
                </form>
            </FormModal>
        </AppLayout>
    );
}