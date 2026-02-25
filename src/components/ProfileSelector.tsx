import React from 'react';
import { User, Briefcase, Building2, Check } from 'lucide-react';
import { ProfileType } from '../types';

interface ProfileSelectorProps {
  currentProfile: ProfileType;
  onSelect: (type: ProfileType) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ currentProfile, onSelect }) => {
  const profiles = [
    { 
      id: 'assalariado', 
      label: 'Assalariado', 
      icon: User, 
      desc: 'Para quem tem renda fixa e quer controlar gastos mensais.',
      color: 'bg-blue-500'
    },
    { 
      id: 'autonomo', 
      label: 'Autônomo', 
      icon: Briefcase, 
      desc: 'Para freelancers com renda variável e controle de clientes.',
      color: 'bg-emerald-500'
    },
    { 
      id: 'empresario', 
      label: 'Empresário', 
      icon: Building2, 
      desc: 'Para donos de negócio com folha de pagamento e lucro/prejuízo.',
      color: 'bg-indigo-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold mb-2">Escolha seu Perfil</h2>
        <p className="text-slate-500">Personalize sua experiência de acordo com sua realidade financeira.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelect(profile.id as ProfileType)}
            className={`relative p-8 rounded-[2.5rem] border-2 text-left transition-all duration-300 group ${
              currentProfile === profile.id 
                ? 'border-primary bg-white dark:bg-slate-900 shadow-xl shadow-primary/10' 
                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-900/50'
            }`}
          >
            {currentProfile === profile.id && (
              <div className="absolute top-6 right-6 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                <Check size={18} />
              </div>
            )}
            
            <div className={`w-14 h-14 ${profile.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <profile.icon size={28} />
            </div>
            
            <h3 className="text-xl font-display font-bold mb-2">{profile.label}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{profile.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
