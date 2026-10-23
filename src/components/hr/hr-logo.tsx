import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HrLogoProps {
  href?: string;
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export function HrLogo({
  href = '/rh',
  className = '',
  showSubtitle = false,
  subtitle = 'Recursos Humanos',
}: HrLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative w-[125px] h-[36px] flex items-center justify-start overflow-hidden">
        <Image
          src="/hr/jmatos.png"
          alt="J.Matos Tecnologia"
          width={125}
          height={36}
          priority
          className="object-contain object-left w-auto h-[32px] max-w-[125px]"
        />
      </div>
      {showSubtitle && (
        <div className="hidden sm:flex flex-col border-l border-[var(--hr-border)] pl-3">
          <span className="text-xs font-semibold text-[var(--hr-text)] uppercase tracking-wider leading-none">
            {subtitle}
          </span>
          <span className="text-[10px] text-[var(--hr-text-muted)] mt-0.5 leading-none">
            J.Matos Tecnologia
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hr-primary)] rounded-[var(--hr-radius-sm)]">
        {content}
      </Link>
    );
  }

  return content;
}
