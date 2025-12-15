import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Add() {
    const { data, setData, errors, post } = useForm<{
        name: string;
        category: string;
        gender: string;
        division: string;
        is_active: boolean;
    }>({
        name: '',
        category: 'team',
        gender: 'mixed',
        division: 'senior',
        is_active: true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('sports.store'));
    }

    return (
        <AppLayout>
            <Head title="Add Sport" />
            <FormModal title="Add Sport" backHref={route('sports.index')}>
                {/* Form */}
                <form
                    onSubmit={submit}
                    className="space-y-6 font-sans"
                >
                    {/* Name */}
                    <div className="grid gap-2">
                        <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                            Sport Name:
                        </label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter sport name"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="grid gap-2">
                        <label className="font-heading text-sm text-[#102d4e]">Category:</label>
                        <div className="flex gap-4">
                            {['team', 'individual', 'hybrid'].map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center gap-1 text-sm capitalize"
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={option}
                                        checked={data.category === option}
                                        onChange={(e) =>
                                            setData('category', e.target.value)
                                        }
                                        className="accent-blue-600"
                                    />
                                    {option.charAt(0).toUpperCase() +
                                        option.slice(1)}
                                </label>
                            ))}
                        </div>
                        {errors.category && (
                            <p className="text-sm text-red-500">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="grid gap-2">
                        <label className="font-heading text-sm text-[#102d4e]">Gender:</label>
                        <div className="flex gap-4">
                            {['male', 'female', 'mixed'].map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center gap-1 text-sm capitalize"
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={option}
                                        checked={data.gender === option}
                                        onChange={(e) =>
                                            setData('gender', e.target.value)
                                        }
                                        className="accent-blue-600"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                        {errors.gender && (
                            <p className="text-sm text-red-500">
                                {errors.gender}
                            </p>
                        )}
                    </div>

                    {/* Division */}
                    <div className="grid gap-2">
                        <label className="font-heading text-sm text-[#102d4e]">Division:</label>
                        <div className="flex gap-4">
                            {['junior', 'senior'].map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center gap-1 text-sm capitalize"
                                >
                                    <input
                                        type="radio"
                                        name="division"
                                        value={option}
                                        checked={data.division === option}
                                        onChange={(e) =>
                                            setData('division', e.target.value)
                                        }
                                        className="accent-blue-600"
                                    />
                                    {option === 'junior'
                                        ? 'Junior (High School)'
                                        : 'Senior (College)'}
                                </label>
                            ))}
                        </div>
                        {errors.division && (
                            <p className="text-sm text-red-500">
                                {errors.division}
                            </p>
                        )}
                    </div>

                    {/* Is Active */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="is_active"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Active:
                        </label>
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            className="h-4 w-4 accent-green-600"
                        />
                        {errors.is_active && (
                            <p className="text-sm text-red-500">
                                {errors.is_active}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
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
