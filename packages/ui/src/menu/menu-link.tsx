import { type MouseEvent, type ReactNode } from "react";
import { useRouter } from "../adapters/router-provider";
import type { LinkTarget } from "./menu-types";

interface MenuLinkProps {
  href: string;
  linkTarget?: LinkTarget;
  className?: string;
  children: ReactNode;
}

function isExternalUrl(url: string): boolean {
  return /^(https?:\/\/|\/\/)/.test(url);
}

/**
 * Router-agnostic menu link.
 *
 * Internal links navigate via the {@link RouterContext} adapter (SPA). When no
 * adapter is provided (no `<RouterContext.Provider>`), or for external / BLANK /
 * WINDOW targets, it renders a plain anchor. Modifier-clicks (cmd/ctrl/shift/alt,
 * middle/right button) fall through to native browser handling so new-tab works.
 */
export function MenuLink({ href, linkTarget, className, children }: MenuLinkProps) {
  const router = useRouter();
  const target: LinkTarget = linkTarget ?? "SELF";

  if (target === "BLANK") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  if (target === "WINDOW") {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      window.open(href, "_blank", "noopener,noreferrer,popup");
    };
    return (
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  }

  if (isExternalUrl(href) || !router) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    router.navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
