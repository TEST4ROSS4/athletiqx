import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Create() {
    const { data, setData, errors, post } = useForm<{
        name: string;
        code: string;
        address: string;
        active: boolean;
    }>({
        name: '',
        code: '',
        address: '',
        active: true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('schools.store'));
    }

    return (
        <AppLayout>
            <Head title="Add School" />
            <FormModal title="Add School" backHref={route('schools.index')}>
                <form
                    onSubmit={submit}
                    className="space-y-6 font-sans"
                >
                    <div className="grid gap-2">
                        <label
                            htmlFor="name"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            School Name:
                        </label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            name="name"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter school name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="code"
                            className="font-heading text-sm text-[#102d4e]"                            >
                            School Code:
                        </label>
                        <input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            name="code"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter school code"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.code}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="address"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Address:
                        </label>
                        <input
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            name="address"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter school address"
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="active"
                            type="checkbox"
                            checked={data.active}
                            onChange={(e) => setData('active', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="active" className="text-sm text-gray-700">
                            Active
                        </label>
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