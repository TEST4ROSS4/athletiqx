import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <Link
              href={home()}
              className="flex flex-col items-center gap-2 font-medium"
            >
              {/* Replace AppLogoIcon with your brand logo */}
              <div className="mb-1 flex h-30 w-30 items-center justify-center rounded-md">
                <img
                  src="/images/logo.png"
                  alt="AthletiQX Logo"
                  className="h-30 w-30 object-contain"
                />
              </div>
              <span className="sr-only">{title}</span>
            </Link>

            <div className="space-y-2 text-center">
              <h1 className="text-xl font-heading font-bold text-[#102d4e]">
                {title}
              </h1>
              <p className="text-center font-heading font-semibold text-md text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}