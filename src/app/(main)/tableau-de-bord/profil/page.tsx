'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User as UserIcon, Camera, Loader2, Save } from 'lucide-react';

export default function ProfilPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        phone: (session.user as any).phone || '',
        location: (session.user as any).location || '',
        bio: (session.user as any).bio || '',
        avatar: session.user.image || (session.user as any).avatar || '',
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const uploadData = new FormData();
      uploadData.append('image', file);

      try {
        setIsLoading(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, avatar: data.url }));
        } else {
          setError('Erreur lors du téléchargement de l\'image');
        }
      } catch (err) {
        setError('Erreur réseau lors du téléchargement');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess('Profil mis à jour avec succès !');
        // Mettre à jour la session côté client
        await update({
          name: data.name,
          image: data.avatar,
        });
      } else {
        const err = await res.json();
        setError(err.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Une erreur réseau est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil Éleveur</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-gray-100">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#2D6A4F] text-white p-3 rounded-full shadow-md hover:bg-[#1B4332] transition-colors"
                title="Changer la photo"
              >
                <Camera size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">Photo de profil</h2>
              <p className="text-gray-500 mt-2 max-w-md">
                Cette photo sera affichée sur vos annonces. Une photo claire de vous-même ou de votre ferme inspire davantage confiance aux clients.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet / Nom de la ferme
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Localisation (Ville, Région)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biographie / Description
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] outline-none resize-none"
                placeholder="Parlez-nous de votre expérience d'éleveur..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 font-medium">
              {success}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-8 py-4 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-xl font-bold shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Enregistrer les modifications</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
