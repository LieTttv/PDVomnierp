
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Truck, 
  Users, 
  TrendingUp, 
  Bell,
  Menu,
  X,
  LogOut,
  Smartphone,
  ShoppingCart,
  UserCheck,
  DownloadCloud,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isMaster, logout, getSessionUser, hasModuleAccess } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getSessionUser().then(async (u) => {
      setUser(u);
      if (u) {
        // Pré-carrega acessos a módulos para o menu
        const modules = ['pedidos', 'estoque', 'faturamento', 'vendas_externas', 'logistica', 'entidades', 'relatorios'];
        const accessMap: any = {};
        for (const mod of modules) {
          accessMap[mod] = await hasModuleAccess(mod);
        }
        setActiveModules(accessMap);
      }
    });
  }, []);

  const master = isMaster();

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'user', 'master'], module: null },
    { to: '/master', icon: ShieldAlert, label: 'Master Admin', roles: ['master'], module: null },
    { to: '/pedidos', icon: ShoppingCart, label: 'Pedidos', roles: ['admin', 'user'], module: 'pedidos' },
    { to: '/estoque', icon: Package, label: 'Estoque', roles: ['admin', 'user'], module: 'estoque' },
    { to: '/entradas', icon: DownloadCloud, label: 'Notas de Entrada', roles: ['admin', 'user'], module: 'estoque' },
    { to: '/faturamento', icon: FileText, label: 'Faturamento', roles: ['admin', 'user'], module: 'faturamento' },
    { to: '/vendas-externas', icon: Smartphone, label: 'Vendas Externas', roles: ['admin', 'user'], module: 'vendas_externas' },
    { to: '/logistica', icon: Truck, label: 'Logística', roles: ['admin', 'user'], module: 'logistica' },
    { to: '/entidades', icon: Users, label: 'Entidades', roles: ['admin', 'user'], module: 'entidades' },
    { to: '/usuarios', icon: UserCheck, label: 'Usuários', roles: ['admin', 'master'], module: null },
    { to: '/relatorios', icon: TrendingUp, label: 'Relatórios', roles: ['admin', 'user'], module: 'relatorios' },
  ];

  // Filtra itens por papel E por módulo liberado (exceto para master)
  const filteredMenu = menuItems.filter(item => {
    if (!user) return false;
    const roleMatch = item.roles.includes(user.role);
    const moduleMatch = master || !item.module || activeModules[item.module];
    return roleMatch && moduleMatch;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-2xl font-black text-blue-700 flex items-center gap-2">
              <Package className="text-blue-600" />
              OmniERP
            </h1>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => (
              <Link 
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  location.pathname === item.to 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acesso:</p>
              <p className="text-xs font-black text-slate-800 truncate">{user?.email || 'Carregando...'}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase mt-1 inline-block ${master ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user?.role}
              </span>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            {menuItems.find(i => i.to === location.pathname)?.label || 'OmniERP'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative"><Bell size={20} /></button>
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">{master ? 'M' : 'U'}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
