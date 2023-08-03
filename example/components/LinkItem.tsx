import Link from "next/link";

const links = [
  ["Basic", "basic"],
  ["Snap Points", "snap-points"],
  ["Non-Blocking", "non-blocking"],
  ["Sticky", "sticky"],
  ["Scroll", "scroll"],
];

function LinkItem({ href, children }: { href: string; children: string }) {
  return (
    <li>
      <Link href={href} className="block py-3 px-5 bg-zinc-100 rounded border">
        {children}
      </Link>
    </li>
  );
}

export function Nav({ className }: { className?: string }) {
  return (
    <div
      className={`md:min-w-[16rem] bg-white md:border p-4 md:p-2 text-lg font-medium ${className}`}
    >
      <ul className="flex flex-col gap-2">
        {links.map(([name, href]) => (
          <LinkItem key={href} href={href}>
            {name}
          </LinkItem>
        ))}
      </ul>
    </div>
  );
}
