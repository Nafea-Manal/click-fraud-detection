import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  MousePointerClick,
  Calculator,
  Zap,
} from "lucide-react";
import { Toaster } from "./Toaster";

const SidebarItem = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-400"}`}
      />
      <span>{label}</span>
    </Link>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-blue-700 font-bold text-xl">
            <LayoutDashboard className="w-6 h-6" />
            <span>FraudGuard</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <SidebarItem to="/" icon={Home} label="Accueil" />
          <SidebarItem
            to="/simulation"
            icon={MousePointerClick}
            label="Simulation"
          />
          <SidebarItem
            to="/simulation-batch"
            icon={Zap}
            label="Simulation Batch"
          />
          <SidebarItem
            to="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard Live"
          />
          <SidebarItem to="/roi" icon={Calculator} label="Analyse ROI" />
        </nav>

        <div className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
          Projet Académique
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Système Web Intelligent de Détection de Clics Suspects
          </h1>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
};
