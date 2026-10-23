import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface HrLogoProps {
  href?: string;
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export function HrLogo({
  href = '/rh',
  className = '',
}: HrLogoProps) {
  const content = (
    <div className={`inline-flex items-center justify-start select-none ${className}`}>
      <div className="relative w-[125px] h-[41px] flex items-center justify-start">
        <Image
          src="/hr/jmatos.png"
          alt="J.Matos Tecnologia"
          width={125}
          height={41}
          priority
          className="w-[125px] h-auto object-contain"
        />
      </div>
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
