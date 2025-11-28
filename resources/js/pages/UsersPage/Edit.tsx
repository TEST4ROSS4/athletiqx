import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Edit User',
    href: '/users',
  },
];

export default function Edit({
  user,
  roles,
  userRole,
}: {
  user: User;
  roles: string[];
  userRole: string[];
}) {
  const { data, setData, errors, put } = useForm({
    name: user.name || '',
    email: user.email || '',
    password: '',
    roles: userRole || [],
  });

  function handleCheckboxSelect(roleName: string, checked: boolean) {
    if (checked) {
      setData('roles', [...data.roles, roleName]);
    } else {
      setData(
        'roles',
        data.roles.filter((name) => name !== roleName),
      );
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put(route('users.update', user.id));
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <div className="p-3">
        <div className="p-3">
          {/* Heading */}
          <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
            Edit User
          </h1>

          {/* Back Button */}
          <Link
            href={route('users.index')}
            className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
          >
            Back
          </Link>

          {/* Form */}
          <form
            onSubmit={submit}
            className="space-y-6 mt-4 max-w-md mx-auto font-sans"
          >
            {/* Name */}
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-sm font-heading text-[#102d4e]"
              >
                Name:
              </label>
              <input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                name="name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-sm font-heading text-[#102d4e]"
              >
                Email:
              </label>
              <input
                id="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                name="email"
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm font-heading text-[#102d4e]"
              >
                Password:
              </label>
              <input
                id="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                name="password"
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Roles */}
            <div className="grid gap-2">
              <label
                htmlFor="roles"
                className="text-sm font-heading text-[#102d4e]"
              >
                Roles:
              </label>
              {roles.map((role) => (
                <label
                  key={`role-${role}`}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    value={role}
                    id={role}
                    checked={data.roles.includes(role)}
                    onChange={(e) =>
                      handleCheckboxSelect(role, e.target.checked)
                    }
                    className="form-checkbox h-5 w-5 rounded text-[#102d4e] focus:ring-2 focus:ring-[#102d4e]"
                  />
                  <span className="text-gray-800 capitalize font-sans">
                    {role}
                  </span>
                </label>
              ))}
              {errors.roles && (
                <p className="mt-1 text-sm text-red-500">{errors.roles}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-[#102d4e] hover:bg-[#0d243d] text-white font-heading font-semibold py-2 px-4 rounded-md transition focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}