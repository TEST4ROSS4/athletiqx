import AppLayout from '@/layouts/app-layout';
import password from '@/routes/password';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';  
import { route } from 'ziggy-js';

 

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View User',
        href: '/users',
    },
];

export default function Show({ user }: { user: User }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View User" />
            <div className='p-3'>
                <div className="p-3">
                    <h1 className="text-2xl font-bold mb-4">CRUD App</h1>
                    
                    <Link href={route('users.index')} className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                        Back
                    </Link>

                    <div>
                        <p><strong>Name: </strong>{user.name}</p>
                        <p><strong>Email: </strong>{user.email}</p>
                    </div>


                </div>
            </div>
        </AppLayout>
    );
}
