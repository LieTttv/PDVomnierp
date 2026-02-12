
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, FileText, Truck, Users, 
  TrendingUp, Menu, X, LogOut, Smartphone, ShoppingCart, 
  UserCheck, DownloadCloud, ShieldAlert, Settings, 
  ShieldCheck, Globe, CreditCard, Activity, Users2,
  Zap, Megaphone, DollarSign
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { isMaster, logout, getSessionUser, hasModuleAccess, getMasterRole } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});
  const location = useLocation();

  useEffect(() => {
    getSessionUser().then(async (u) => {
      setUser(u);
      if (u && !isMaster()) {
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
  const hqRole = getMasterRole();

  const masterMenuItems = [
    { to: '/master', icon: LayoutDashboard, label: 'HQ Dashboard' },
    { to: '/time-hq', icon: Users2, label: 'Equipe Omni HQ' },
    { to: '/usuarios-globais', icon: UserCheck, label: 'Painel de Clientes' },
    { to: '/financeiro-hq', icon: DollarSign, label: 'Financeiro SaaS' },
    { to: '/avisos-hq', icon: Megaphone, label: 'Quadro de Avisos' },
    { to: '/config-sistema', icon: Settings, label: 'Infra & SaaS' },
  ];

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

  const isMasterPath = location.pathname.startsWith('/master') || 
                       location.pathname.startsWith('/time') || 
                       location.pathname.startsWith('/usuarios-globais') || 
                       location.pathname.startsWith('/financeiro-hq') || 
                       location.pathname.startsWith('/avisos-hq') || 
                       location.pathname.startsWith('/config');

  const currentMenu = master && isMasterPath
    ? masterMenuItems 
    : storeMenuItems.filter(item => !item.module || activeModules[item.module]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${master && isMasterPath ? 'bg-[#0f172a] border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className={`p-8 border-b flex items-center justify-between ${master && isMasterPath ? 'border-slate-800' : 'border-slate-100'}`}>
            <h1 className={`text-3xl font-black flex items-center gap-2 ${master && isMasterPath ? 'text-indigo-400 italic' : 'text-blue-700'}`}>
              <Zap size={32} />
              {master && isMasterPath ? 'HQ Center' : 'OmniERP'}
            </h1>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 mb-4 ${master && isMasterPath ? 'text-slate-500' : 'text-slate-400'}`}>
              {master && isMasterPath ? 'SaaS Headquarters' : 'Store Operations'}
            </p>
            {currentMenu.map((item) => (
              <Link 
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                  location.pathname === item.to 
                    ? (master && isMasterPath ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-100') 
                    : (master && isMasterPath ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600')
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={`p-6 border-t ${master && isMasterPath ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`px-5 py-4 rounded-[24px] mb-6 ${master && isMasterPath ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${master && isMasterPath ? 'text-slate-500' : 'text-slate-400'}`}>
                Identificado como
              </p>
              <p className={`text-xs font-black truncate ${master && isMasterPath ? 'text-indigo-300' : 'text-slate-800'}`}>
                {user?.name || 'Loading...'}
              </p>
            </div>
            <button 
              onClick={logout}
              className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${master && isMasterPath ? 'text-slate-400 hover:bg-rose-900/30 hover:text-rose-400' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
            >
              <LogOut size={20} />
              Sair do Painel
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
               {master && !isMasterPath && (
                  <Link to="/master" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                    <ShieldCheck size={14} /> Voltar ao Controle HQ
                  </Link>
               )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            {master && (
               <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <Activity size={16} className="text-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Global Master Access</span>
               </div>
            )}
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${master && isMasterPath ? 'bg-[#0f172a]' : 'bg-blue-600'}`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/30 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
