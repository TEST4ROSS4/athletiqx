import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Sport',
        href: '/sports',
    },
];

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Sport" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Add Sport</h1>

                <Link
                    href={route('sports.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                    Back
                </Link>

                <form
                    onSubmit={submit}
                    className="mx-auto mt-4 max-w-md space-y-6"
                >
                    {/* Name */}
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
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
                        <label className="text-sm font-medium">Category:</label>
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
                        <label className="text-sm font-medium">Gender:</label>
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
                        <label className="text-sm font-medium">Division:</label>
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
                            className="text-sm font-medium"
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
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
