import React, { useState } from 'react';
import { X, ShieldCheck, Check, Sparkles, User, CreditCard, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAppNavigation();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Impossible de se connecter pour le moment. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-lg">Espace Client PENTA GAD</h3>
          <p className="text-xs text-slate-300 mt-1">
            Connectez-vous pour accéder à vos contrats de crédit échelonné et groupes de tontine.
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800">Paiement Échelonné Sécurisé :</span>
                <p className="text-slate-500">Suivi des échéances, de vos versements et de votre solde restant.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-amber-50 text-amber-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800">Tontine Rotative :</span>
                <p className="text-slate-500">Adhésion aux groupes d'épargne et notification de votre date de tirage.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-blue-50 text-blue-600 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800">Achat direct simplifié :</span>
                <p className="text-slate-500">Pré-remplissage de vos coordonnées de livraison à Abidjan et en région.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <p className="text-[11px] text-center text-slate-400">
            Connexion sécurisée via Firebase Authentication. Vos données personnelles restent strictement confidentielles.
          </p>
        </div>

      </div>
    </div>
  );
};
