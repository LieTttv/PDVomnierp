
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Store as StoreIcon, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getUserStores, setActiveStoreId } from '../services/authService';
import { StoreUser } from '../types';

const SelectStore: React.FC = () => {
  const [stores, setStores] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const userStores = await getUserStores(user.id);
      setStores(userStores);
      setLoading(false);
    };
    fetchStores();
  }, [navigate]);

  const handleSelect = (storeId: string) => {
    setActiveStoreId(storeId);
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">Selecione a Unidade</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Escolha qual loja deseja gerenciar agora</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((su) => (
            <button
              key={su.store_id}
              onClick={() => handleSelect(su.store_id)}
              className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl hover:scale-105 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <StoreIcon size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{su.stores?.nome_fantasia}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">CNPJ: {su.stores?.cnpj}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-[9px] font-black uppercase px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1">
                  <ShieldCheck size={10} /> Plano {su.stores?.plano_ativo}
                </span>
                <ArrowRight className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectStore;
