import { Nav } from "@/components/LinkItem";

function Layout() {
  return (
    <div className="md:bg-gray-50">
      <div className="container max-w-6xl min-h-screen flex flex-col">
        <div className="md:grid md:grid-cols-[auto_1fr] md:gap-12 flex-1 md:py-32">
          <Nav />
        </div>
      </div>
    </div>
  );
}

export default Layout;
