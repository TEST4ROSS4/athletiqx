import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { can } from '@/lib/can';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    LibraryBig,
    School,
    UserCheck,
    UserCog,
    Users,
    Group,
} from 'lucide-react';
import AppLogo from './app-logo';

type AuthUser = {
    name: string;
    email: string;
    roles: string[];
    permissions: string[]; // ✅ added to fix TS error
};

type PageProps = {
    auth: {
        user: AuthUser;
    };
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const roles = user?.roles || [];

    const isSuperAdmin = roles.includes('super_admin');
    const isSchoolAdmin =
        roles.includes('admin') || roles.includes('school-admin');

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        can('users.view') && {
            title: 'Users',
            href: '/users',
            icon: Users,
        },
        can('roles.view') && {
            title: 'Roles',
            href: '/roles',
            icon: UserCheck,
        },
        can('courses.view') && {
            title: 'Courses',
            href: '/courses',
            icon: LibraryBig,
        },
        can('sections.view') && {
            title: 'Sections',
            href: '/sections',
            icon: Group,
        },
        can('course-sections.view') && {
        title: 'Course Sections',
        href: '/course-sections',
        icon: BookOpen,
        },
        isSuperAdmin &&
            can('schools.view') && {
                title: 'Schools',
                href: '/schools',
                icon: School,
            },
        isSuperAdmin &&
            can('school-admins.view') && {
                title: 'School Admin',
                href: '/school-admins',
                icon: UserCog,
            },
    ].filter(Boolean) as NavItem[];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
