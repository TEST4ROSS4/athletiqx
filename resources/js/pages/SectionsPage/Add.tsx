import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Create() {
    const { data, setData, errors, post } = useForm<{
        code: string;
        program: string;
    }>({
        code: '',
        program: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('sections.store'));
    }

    return (
        <AppLayout>
            <Head title="Add Section" />
            <FormModal title="Add Section" backHref={route('sections.index')}>
                <form
                    onSubmit={submit}
                    className="space-y-6 font-sans"
                >
                    <div className="grid gap-2">
                        <label
                            htmlFor="code"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Section Code:
                        </label>
                        <input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            name="code"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter section code"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.code}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="program"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Program:
                        </label>
                        <input
                            id="program"
                            value={data.program}
                            onChange={(e) => setData('program', e.target.value)}
                            name="program"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter program name"
                        />
                        {errors.program && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.program}
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