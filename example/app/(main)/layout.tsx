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

function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-gray-50">
      <div className="container max-w-6xl min-h-screen flex flex-col">
        <div className="grid grid-cols-[auto_1fr] gap-16 flex-1 py-32">
          <div className="min-w-[16rem] bg-white border p-2 text-lg font-medium">
            <ul className="flex flex-col gap-2">
              {links.map(([name, href]) => (
                <LinkItem key={href} href={href}>
                  {name}
                </LinkItem>
              ))}
            </ul>
          </div>
          <div className="relative border overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
