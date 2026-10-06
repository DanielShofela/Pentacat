import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Users, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAppNavigation();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error('Login error:', err);
      setError('Impossible de se connecter pour le moment. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title="Espace Client PENTA GAD"
      subtitle="Connectez-vous pour suivre vos contrats et cotisations"
      maxWidth="sm"
    >
      <div className="space-y-5">
        
        {/* Why connect */}
        <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-start gap-3">
            <CreditCard className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Paiement Échelonné :</span>
              <p className="text-slate-500">Suivez l'état de votre contrat, de vos versements et de votre solde.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Tontine Rotative :</span>
              <p className="text-slate-500">Consultez votre tour de rotation et la date de remise de votre bien.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Historique des achats :</span>
              <p className="text-slate-500">Accédez à vos bons de commande et certificats de garantie.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Google Auth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-all duration-150 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Connexion en cours...' : 'Continuer avec Google'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Authentification sécurisée Firebase Auth</span>
        </div>

      </div>
    </Modal>
  );
};
