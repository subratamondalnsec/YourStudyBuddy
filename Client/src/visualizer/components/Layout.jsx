import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import Sidebar component

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/visualizer" || location.pathname === "/visualizer/";
  const isRaceModePage = location.pathname.endsWith("/race-mode");

  return (
    <div className="lg:ml-64">
      <div className="flex flex-1 w-full">
        {!isHomePage && !isRaceModePage && (
          <aside className="hidden xl:block md:w-64 flex-shrink-0">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
