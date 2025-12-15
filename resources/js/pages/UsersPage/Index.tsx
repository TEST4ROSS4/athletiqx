import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { FormModal } from '@/components/form-modal';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: '/users',
  },
];

export default function Index({ users, roles = [] }: { users: User[]; roles?: string[] }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    email: '',
    password: '',
    role: '',
    roles: [] as string[],
  });

  const itemsPerPage = 9;

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.roles.some((r) => r.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function confirmDelete(id: number) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (deleteId) {
      router.delete(route('users.destroy', deleteId));
      setDeleteId(null);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextRoles = data.role ? [data.role] : [];
    setData('roles', nextRoles);
    post(route('users.store'), {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="p-6">
        <div className="space-y-6">
          {/* Heading */}
          <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
            User Management
          </h1>

          {/* Top Controls */}
          <div className="flex items-center justify-between gap-4">
            {can('users.create') && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
              >
                Add User
              </button>
            )}

            {/* Search Bar */}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // reset to first page when searching
              }}
              placeholder="Search users..."
              className="w-64 rounded-md border border-gray-300 px-3 py-2 font-sans text-sm shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full font-sans text-sm text-gray-700">
              <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="transition hover:bg-[#0d243d] hover:text-white"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{u.id}</td>
                      <td className="px-6 py-4">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        {u.roles.map((role) => (
                          <span
                            key={role.name}
                            className="mr-2 inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 font-heading text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            {role.name}
                          </span>
                        ))}
                      </td>
                      <td className="space-x-2 px-6 py-4">
                        {can('users.edit') && (
                          <Link
                            href={route('users.edit', u.id)}
                            className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                          >
                            Edit
                          </Link>
                        )}
                        {can('users.view') && (
                          <Link
                            href={route('users.show', u.id)}
                            className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                          >
                            View
                          </Link>
                        )}
                        {can('users.delete') && (
                          <button
                            onClick={() => confirmDelete(u.id)}
                            className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center font-heading text-sm text-gray-500"
                    >
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex justify-between items-center mt-4">
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
              Are you sure you want to delete this user? This action cannot be undone.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 py-6 backdrop-blur-sm">
          <FormModal
            title="Add User"
            backHref={route('users.index')}
            backLabel="Close"
            onBack={() => {
              reset();
              setShowModal(false);
            }}
          >
            <form onSubmit={submit} className="space-y-6 font-sans">
              <div className="grid gap-2">
                <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                  Name:
                </label>
                <input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  placeholder="Enter name"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="font-heading text-sm text-[#102d4e]">
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  placeholder="Enter email"
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="password" className="font-heading text-sm text-[#102d4e]">
                  Password:
                </label>
                <input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  placeholder="Enter password"
                  required
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="role" className="font-heading text-sm text-[#102d4e]">
                  Role:
                </label>
                <select
                  id="role"
                  value={data.role}
                  onChange={(e) => {
                    setData('role', e.target.value);
                    setData('roles', e.target.value ? [e.target.value] : []);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={`role-${role}`} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {(errors.roles || errors.role) && (
                  <p className="mt-1 text-sm text-red-500">{errors.roles || errors.role}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-60"
                >
                  Submit
                </button>
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
              </div>
            </form>
          </FormModal>
        </div>
      )}
    </AppLayout>
  );
}