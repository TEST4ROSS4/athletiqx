import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';
 

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Index({ users }: { users: User[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className='p-3'>
                <div className="p-3">
                    <h1 className="text-2xl font-bold mb-4">CRUD App</h1>
                    <button className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                        Add User
                    </button>
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3 w-70">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            
                            {users.map(({id, name, email}) =>    
                            <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
                                <td className="px-6 py-2 font-medium text-gray-900">{id}</td>
                                <td className="px-6 py-2 text-gray-700">{name}</td>
                                <td className="px-6 py-2 text-gray-700">{email}</td>
                                <td className="px-6 py-2 space-x-1">
                                    <button className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                        Edit
                                    </button>
                                    <button className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300">
                                        Show
                                    </button>
                                    <button className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
