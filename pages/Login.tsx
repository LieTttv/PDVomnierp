
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Package, User, HelpCircle, X, MessageSquare } from 'lucide-react';
import { login, getUserStores, setActiveStoreId, isMaster } from '../services/authService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(email, password);
      if (user) {
        if (isMaster()) {
          navigate('/master');
          return;
        }

        const stores = await getUserStores(user.id);
        
        if (stores.length === 0) {
          setError('Sua conta ainda não está vinculada a nenhuma loja.');
        } else if (stores.length === 1) {
          setActiveStoreId(stores[0].store_id);
          navigate('/');
        } else {
          navigate('/select-store');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[160px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[160px] opacity-10 translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl p-12 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-6 rotate-3">
            <Package size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">OmniERP</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-3">Sistemas de Gestão Inteligente</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black rounded-2xl text-center uppercase tracking-wide animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identificação / E-mail</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                required
                placeholder="Ex: MASTER ou email@loja.com"
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none font-black text-sm transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave de Acesso</label>
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="password" 
                required
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none font-black text-sm transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (
              <>
                Entrar no Sistema <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2024 OmniERP Global Solutions</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Recuperar Acesso</h3>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Para redefinir sua chave de acesso ou recuperar seu login, por favor:
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest">
                <MessageSquare size={16} /> Entre em contato com o MANAGER
              </div>
            </div>
            <button 
              onClick={() => setShowForgotModal(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              Entendido <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
