
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
  Settings,
  Building2,
  Key,
  Layers
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

  // Itens de Menu específicos para o MASTER (Gestão do SaaS)
  const masterMenuItems = [
    { to: '/master', icon: ShieldAlert, label: 'Controle de Lojas' },
    { to: '/usuarios-globais', icon: UserCheck, label: 'Usuários das Lojas' },
    { to: '/config-sistema', icon: Settings, label: 'Configurações SaaS' },
  ];

  // Itens de Menu específicos para a LOJA (Operacional)
  const storeMenuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', module: null },
    { to: '/pedidos', icon: ShoppingCart, label: 'Pedidos', module: 'pedidos' },
    { to: '/estoque', icon: Package, label: 'Estoque', module: 'estoque' },
    { to: '/entradas', icon: DownloadCloud, label: 'Notas de Entrada', module: 'estoque' },
    { to: '/faturamento', icon: FileText, label: 'Faturamento', module: 'faturamento' },
    { to: '/vendas-externas', icon: Smartphone, label: 'Vendas Externas', module: 'vendas_externas' },
    { to: '/logistica', icon: Truck, label: 'Logística', module: 'logistica' },
    { to: '/entidades', icon: Users, label: 'Entidades', module: 'entidades' },
    { to: '/usuarios', icon: UserCheck, label: 'Config. Usuários', module: null },
    { to: '/relatorios', icon: TrendingUp, label: 'Relatórios BI', module: 'relatorios' },
  ];

  const currentMenu = master ? masterMenuItems : storeMenuItems.filter(item => !item.module || activeModules[item.module]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Cor muda se for Master */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${master ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className={`p-6 border-b flex items-center justify-between ${master ? 'border-slate-800' : 'border-slate-100'}`}>
            <h1 className={`text-2xl font-black flex items-center gap-2 ${master ? 'text-indigo-400' : 'text-blue-700'}`}>
              <Package size={28} />
              {master ? 'OmniMaster' : 'OmniERP'}
            </h1>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className={`text-[10px] font-black uppercase tracking-widest px-4 mb-2 ${master ? 'text-slate-500' : 'text-slate-400'}`}>
              Menu {master ? 'Administrativo' : 'Operacional'}
            </p>
            {currentMenu.map((item) => (
              <Link 
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  location.pathname === item.to 
                    ? (master ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-100') 
                    : (master ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600')
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={`p-4 border-t ${master ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`px-4 py-3 rounded-2xl mb-4 ${master ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${master ? 'text-slate-500' : 'text-slate-400'}`}>
                {master ? 'Painel Central' : 'Loja Ativa'}
              </p>
              <p className={`text-xs font-black truncate ${master ? 'text-indigo-300' : 'text-slate-800'}`}>
                {user?.name || 'Carregando...'}
              </p>
            </div>
            <button 
              onClick={logout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-bold text-sm ${master ? 'text-slate-400 hover:bg-rose-900/30 hover:text-rose-400' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
            >
              <LogOut size={18} />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              {master ? 'Administração de Lojas' : 'Operação de Loja'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {master && (
              <span className="hidden md:block text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Modo Master Ativado</span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs ${master ? 'bg-slate-900' : 'bg-blue-600'}`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
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
