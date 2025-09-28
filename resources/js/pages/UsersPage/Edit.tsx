import AppLayout from '@/layouts/app-layout';
import password from '@/routes/password';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';  
import { route } from 'ziggy-js';

 

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit User',
        href: '/users',
    },
];

export default function Edit({ user, roles, userRole }: { user: User; roles: string[]; userRole: string[]; }) {

    const {data, setData, errors, put} = useForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        roles: userRole || []
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
            <div className='p-3'>
                <div className="p-3">
                    <h1 className="text-2xl font-bold mb-4">CRUD App</h1>
                    
                    <Link href={route('users.index')} className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                        Back
                    </Link>

                   <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto">
                   
                       <div className="grid gap-2">
                           <label htmlFor="name" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                               Name:
                           </label>
                           <input
                               id="name"
                               value={data.name}
                               onChange={(e) => setData('name', e.target.value)}
                               name="name"
                               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Enter your name"
                           />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                       </div>

                       <div className="grid gap-2">
                           <label htmlFor="email" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                               Email:
                           </label>
                           <input
                               id="email"
                               value={data.email}
                               onChange={(e) => setData('email', e.target.value)}
                               name="email"
                               type='email'
                               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Enter your email"
                           />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                       </div>

                       <div className="grid gap-2">
                           <label htmlFor="password" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                               Password:
                           </label>
                           <input    
                               id="password"
                               value={data.password}
                               onChange={(e) => setData('password', e.target.value)}
                               name="password"
                               type='password'
                               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Enter your password"
                           />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                       </div>

                       <div className="grid gap-2">
                            <label
                                htmlFor="roles"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
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
                                            handleCheckboxSelect(
                                                role,
                                                e.target.checked,
                                            )
                                        }
                                        className="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-800 capitalize">
                                        {role}
                                    </span>
                                </label>
                            ))}
                            {errors.roles && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.roles}
                                </p>
                            )}
                        </div>
                   
                       <button
                           type="submit"
                           className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
                       >
                           Submit
                       </button>
                   
                   </form>
                </div>
            </div>
        </AppLayout>
    );
}
