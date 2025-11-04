import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const demoRef = useRef<HTMLDivElement>(null);

    const scrollToDemo = () => {
        demoRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Top Navigation */}
                <nav className="flex w-full items-center justify-between border-b border-[#eaeaea] px-6 py-4 dark:border-[#2a2a2a]">
                    <div className="text-lg font-semibold tracking-tight">
                        AthletiQX
                    </div>
                    <div className="lg:hidden">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-[#1b1b18] focus:outline-none dark:text-[#EDEDEC]"
                            aria-label="Toggle menu"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="hidden gap-3 text-sm lg:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md border border-[#19140035] px-4 py-1.5 hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md border border-transparent px-4 py-1.5 hover:border-[#19140035] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md border border-[#19140035] px-4 py-1.5 hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="flex flex-col gap-3 border-b border-[#eaeaea] px-6 py-4 text-sm lg:hidden dark:border-[#2a2a2a]">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md border border-[#19140035] px-4 py-2 hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md border border-transparent px-4 py-2 hover:border-[#19140035] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md border border-[#19140035] px-4 py-2 hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                        Empowering Student-Athletes & Educators
                    </h1>
                    <p className="mt-4 max-w-xl text-base text-[#4a4a45] sm:text-lg dark:text-[#bcbcb7]">
                        AthletiQX helps student-athletes, professors, and
                        coaches monitor performance across academics and
                        athletics — all in one platform.
                    </p>
                    {!auth.user && (
                        <button
                            onClick={scrollToDemo}
                            className="mt-6 inline-block rounded-md bg-[#1b1b18] px-6 py-2 text-white hover:bg-[#2a2a25] dark:bg-[#EDEDEC] dark:text-[#0a0a0a] dark:hover:bg-[#d6d6d4]"
                        >
                            Get Started
                        </button>
                    )}
                </main>
                {/* Feature Cards */}
                <section className="bg-[#FAFAF9] px-6 py-12 dark:bg-[#121212]">
                    <div className="mx-auto grid max-w-6xl gap-8 text-center sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: '📊 Performance Dashboards',
                                desc: 'Track academic and athletic metrics in real time with personalized insights.',
                            },
                            {
                                title: '🎓 Academic Monitoring',
                                desc: 'Professors can view attendance, grades, and progress across semesters.',
                            },
                            {
                                title: '🏅 Athletic Insights',
                                desc: 'Coaches get access to training logs, performance trends, and goal tracking.',
                            },
                            {
                                title: '🤝 Role-Based Access',
                                desc: 'Secure, scalable access for students, faculty, and staff with tailored permissions.',
                            },
                            {
                                title: '📈 Progress Analytics',
                                desc: 'Visualize growth over time with charts and predictive indicators.',
                            },
                            {
                                title: '🔔 Smart Notifications',
                                desc: 'Stay informed with automated alerts for deadlines, milestones, and performance dips.',
                            },
                        ].map((card, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border border-[#eaeaea] p-6 transition hover:shadow-md dark:border-[#2a2a2a]"
                            >
                                <h3 className="text-lg font-medium">
                                    {card.title}
                                </h3>
                                <p className="mt-2 text-sm text-[#4a4a45] dark:text-[#bcbcb7]">
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Value Proposition */}
                <section className="px-6 py-12 text-center">
                    <h2 className="text-2xl font-semibold">Why AthletiQX?</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-[#4a4a45] dark:text-[#bcbcb7]">
                        Built for collaboration, AthletiQX bridges the gap
                        between academics and athletics. Whether you're
                        mentoring, coaching, or competing — we help you stay
                        aligned and informed.
                    </p>
                </section>
                <section
                    ref={demoRef}
                    className="bg-[#FDFDFC] px-6 py-20 dark:bg-[#0a0a0a]"
                >
                    <div className="mx-auto max-w-6xl">
                        {/* Headline + Subtext */}
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl leading-tight font-bold">
                                Request a Personalized Demo
                            </h2>
                            <p className="mx-auto mt-4 max-w-3xl text-base text-[#4a4a45] dark:text-[#bcbcb7]">
                                Every institution has unique goals—and so do our
                                demos. We’ll tailor a walkthrough that
                                highlights the most relevant tools for your
                                team.
                            </p>
                        </div>

                        {/* Grid Layout: Cards + Form */}
                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                            {/* Left: Feature Cards */}
                            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
                                {[
                                    {
                                        title: '🎯 Tailored Walkthroughs',
                                        desc: 'We focus on what matters most to your role and goals.',
                                    },
                                    {
                                        title: '🏫 Real Use Cases',
                                        desc: 'See how similar programs use AthletiQX to drive results.',
                                    },
                                    {
                                        title: '🤝 Built for Teams',
                                        desc: 'Designed for student-athletes, professors, and coaches.',
                                    },
                                    {
                                        title: '🚀 Fast Setup',
                                        desc: 'Get started in minutes with guided onboarding.',
                                    },
                                ].map((card, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-[#eaeaea] bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#121212]"
                                    >
                                        <h3 className="text-md font-semibold">
                                            {card.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-[#4a4a45] dark:text-[#bcbcb7]">
                                            {card.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Demo Form */}
                            <div className="rounded-2xl border border-[#eaeaea] bg-white p-8 shadow-lg dark:border-[#2a2a2a] dark:bg-[#181818]">
                                <h3 className="mb-2 text-xl font-semibold">
                                    Let’s get you started
                                </h3>
                                <p className="mb-6 text-sm text-[#4a4a45] dark:text-[#bcbcb7]">
                                    Enter your work email and we’ll reach out
                                    with a tailored demo experience.
                                </p>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        alert(
                                            '✅ Thanks! We’ll be in touch shortly.',
                                        );
                                    }}
                                    className="space-y-4"
                                >
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@university.edu"
                                        className="w-full rounded-md border border-[#ccc] bg-[#FDFDFC] px-4 py-2 text-[#1b1b18] focus:ring-2 focus:ring-[#1b1b18] focus:outline-none dark:border-[#444] dark:bg-[#0f0f0f] dark:text-[#EDEDEC] dark:focus:ring-[#EDEDEC]"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full rounded-md bg-[#1b1b18] py-2 font-medium text-white transition hover:bg-[#2a2a25] dark:bg-[#EDEDEC] dark:text-[#0a0a0a] dark:hover:bg-[#d6d6d4]"
                                    >
                                        Request Demo
                                    </button>
                                </form>

                                <div className="mt-6 text-xs text-[#7a7a75] dark:text-[#a5a5a0]">
                                    🔒 Your information is secure. We’ll only
                                    use it to schedule your demo.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Footer */}
                <footer className="mt-auto px-6 py-4 text-center text-xs text-[#7a7a75] dark:text-[#a5a5a0]">
                    &copy; {new Date().getFullYear()} AthletiQX. All rights
                    reserved.
                </footer>
            </div>
        </>
    );
}
