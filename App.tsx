
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Guard from './components/Guard';
import Login from './pages/Login';
import SelectStore from './pages/SelectStore';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Logistics from './pages/Logistics';
import Orders from './pages/Orders';
import ExternalSales from './pages/ExternalSales';
import Entities from './pages/Entities';
import Users from './pages/Users';
import Reports from './pages/Reports';
import IncomingInvoices from './pages/IncomingInvoices';
import MasterDashboard from './pages/MasterDashboard';
import GlobalUsers from './pages/GlobalUsers';
import SaaSSettings from './pages/SaaSSettings';
import MasterTeam from './pages/MasterTeam';
import HQFinancial from './pages/HQFinancial';
import HQNotices from './pages/HQNotices';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/select-store" element={<Guard><SelectStore /></Guard>} />
        
        <Route path="/" element={<Guard><Layout><Dashboard /></Layout></Guard>} />
        
        {/* HQ Master Routes */}
        <Route path="/master" element={<Guard><Layout><MasterDashboard /></Layout></Guard>} />
        <Route path="/time-hq" element={<Guard><Layout><MasterTeam /></Layout></Guard>} />
        <Route path="/usuarios-globais" element={<Guard><Layout><GlobalUsers /></Layout></Guard>} />
        <Route path="/financeiro-hq" element={<Guard><Layout><HQFinancial /></Layout></Guard>} />
        <Route path="/avisos-hq" element={<Guard><Layout><HQNotices /></Layout></Guard>} />
        <Route path="/config-sistema" element={<Guard><Layout><SaaSSettings /></Layout></Guard>} />

        {/* Operational Routes */}
        <Route path="/pedidos" element={<Guard><Layout><Orders /></Layout></Guard>} />
        <Route path="/estoque" element={<Guard><Layout><Inventory /></Layout></Guard>} />
        <Route path="/entradas" element={<Guard><Layout><IncomingInvoices /></Layout></Guard>} />
        <Route path="/faturamento" element={<Guard><Layout><Billing /></Layout></Guard>} />
        <Route path="/vendas-externas" element={<Guard><Layout><ExternalSales /></Layout></Guard>} />
        <Route path="/logistica" element={<Guard><Layout><Logistics /></Layout></Guard>} />
        <Route path="/entidades" element={<Guard><Layout><Entities /></Layout></Guard>} />
        <Route path="/usuarios" element={<Guard><Layout><Users /></Layout></Guard>} />
        <Route path="/relatorios" element={<Guard><Layout><Reports /></Layout></Guard>} />
      </Routes>
    </Router>
  );
};

export default App;
