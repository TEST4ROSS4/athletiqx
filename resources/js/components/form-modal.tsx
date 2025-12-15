import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type FormModalProps = {
  title: string;
  backHref: string;
  backLabel?: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
};

export function FormModal({ title, backHref, backLabel = 'Back', description, children, onBack }: FormModalProps) {
  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Link
            href={backHref}
            onClick={(e) => {
              if (onBack) {
                e.preventDefault();
                onBack();
              }
            }}
            className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/70"
          >
            {backLabel}
          </Link>
        </div>
        <div className="px-6 py-5 text-foreground">{children}</div>
      </div>
    </div>
  );
}
