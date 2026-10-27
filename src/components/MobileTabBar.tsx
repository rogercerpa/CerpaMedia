"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileNav } from "@/components/MobileNavProvider";
import {
  MOBILE_TABS,
  activeMobileTab,
  mobileTabBarInsetClass,
  shouldShowMobileTabBar,
  type MobileTabId,
} from "@/components/mobile-tabs";

const itemClass =
  "relative flex h-full w-full min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white";

export function MobileTabBarInset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className={mobileTabBarInsetClass(pathname)}>{children}</div>;
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const { open, toggle, close } = useMobileNav();

  if (!shouldShowMobileTabBar(pathname)) return null;

  const current = activeMobileTab(pathname);

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-cta pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex h-14 max-w-lg items-stretch">
        <li className="flex flex-1">
          <button
            id="mobile-tab-menu"
            type="button"
            className={`${itemClass} ${open ? "font-medium text-white" : "text-neutral-400 hover:text-white"}`}
            aria-expanded={open}
            aria-controls="mobile-nav-menu"
            onClick={toggle}
          >
            <ActiveMark on={open} />
            <TabIcon name={open ? "close" : "menu"} />
            <span>Menu</span>
          </button>
        </li>
        {MOBILE_TABS.map((tab) => {
          const selected = !open && current === tab.id;
          return (
            <li key={tab.id} className="flex flex-1">
              <Link
                href={tab.href}
                aria-label={"accessibleName" in tab ? tab.accessibleName : undefined}
                aria-current={current === tab.id ? "page" : undefined}
                className={`${itemClass} ${selected ? "font-medium text-white" : "text-neutral-400 hover:text-white"}`}
                onClick={close}
              >
                <ActiveMark on={selected} />
                <TabIcon name={tab.id} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ActiveMark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 ${on ? "bg-white" : "bg-transparent"}`}
    />
  );
}

function TabIcon({ name }: { name: MobileTabId | "menu" | "close" }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="M6 18 18 6M6 6l12 12" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 10v10h12V10" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (name === "services") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
      </svg>
    );
  }

  if (name === "launch") {
    return (
      <svg {...common}>
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M7 3.5h7.2L19 8.2V20.5H7V3.5Z" />
      <path d="M14 3.5V8.5h5" />
      <path d="M10 12.5h6M10 16h4" />
    </svg>
  );
}
