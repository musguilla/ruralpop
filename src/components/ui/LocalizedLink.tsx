'use client';

import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';
import { useLocalizedRoute } from '@/i18n/hooks';

export interface LocalizedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  href: string;
}

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ href, ...props }, ref) => {
    const { getPath } = useLocalizedRoute();
    const localizedHref = getPath(href);

    return <Link ref={ref} href={localizedHref} {...props} />;
  }
);

LocalizedLink.displayName = 'LocalizedLink';
