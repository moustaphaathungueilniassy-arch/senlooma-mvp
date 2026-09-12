'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, X, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { listingSchema } from '@/lib/validators';
import { z } from 'zod';

type ListingFormValues = z.input<typeof listingSchema>;

export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const [checkingSub, setCheckingSub] = useState(true);
  const [hasSub, setHasSub] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingData, setPendingData] = useState<ListingFormValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'WAVE' | 'ORANGE_MONEY' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      quantity: 1,
      currency: 'XOF',
    },
  });

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/abonnement/status');
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
        if (res.ok) {
          // const data = await res.json();
          // setHasSub(data.active);
          // TEMPORAIREMENT GRATUIT : Tout le monde a le droit de publier
          setHasSub(true);
        } else {
          setHasSub(true); // Forcé à true pour l'accès gratuit
        }
      } catch (error) {
        console.error('Erreur vérification abonnement', error);
      } finally {
        setCheckingSub(false);
      }
    };
    checkSubscription();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles].slice(0, 5));

      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const onSubmit = async (data: ListingFormValues) => {
    setSubmitError(null);

    if (images.length < 3) {
      setSubmitError('Veuillez ajouter au moins 3 photos de l\'animal.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // 1. Upload images concurrently
      const uploadPromises = images.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const resData = await uploadRes.json();
          return resData.url;
        }
        let errorMsg = 'Erreur lors de l\'upload d\'une image';
        try {
          const errData = await uploadRes.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {}
        throw new Error(errorMsg);
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      const processedData = {
        ...data,
        age: isNaN(data.age as any) ? undefined : data.age,
        weight: isNaN(data.weight as any) ? undefined : data.weight,
        sex: !data.sex ? undefined : data.sex,
        breed: !data.breed ? undefined : data.breed,
        images: uploadedUrls,
        provider: 'wave', // Un fournisseur factice pour passer la validation si elle est encore là
      };

      // 2. Submit listing
      const res = await fetch('/api/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (res.ok) {
        const result = await res.json();
        router.push(`/annonces/${result.data.id}`);
      } else {
        const errData = await res.json();
        setSubmitError(errData.details ? `${errData.error} : ${errData.details}` : (errData.message || errData.error || 'Erreur lors de la publication'));
      }
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentAndPublish = async () => {};

  if (checkingSub) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-md text-center border-t-4 border-[#2D6A4F]">
        <UserIcon className="w-16 h-16 mx-auto text-[#2D6A4F] mb-4" />
        <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
        <p className="text-gray-600 mb-8">
          Vous devez vous connecter à votre compte pour publier une annonce.
        </p>
        <Link href="/connexion" className="block w-full py-3 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg font-semibold transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }
  // Plus de vérification d'abonnement puisque le paiement se fait à la publication
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#2D6A4F] mb-8">
        Publier une annonce
      </h1>
      
      {submitError && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
      >
        {/* Photos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photos (Min 3, Max 5) <span className="text-red-500">*</span>
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label="Ajouter des photos"
          >
            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Cliquez pour ajouter au moins 3 photos (maximum 5)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          {imageUrls.length > 0 && (
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Supprimer l'image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Titre de l&apos;annonce <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Ex: Taureau Gobra de 3 ans"
              className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              {...register('categoryId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
            >
              <option value="">Sélectionnez...</option>
              <option value="bovins">Bovins 🐄</option>
              <option value="ovins">Ovins 🐑</option>
              <option value="caprins">Caprins 🐐</option>
              <option value="volailles">Volailles 🐔</option>
              <option value="equins">Équins 🐴</option>
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.categoryId.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Prix (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              placeholder="Ex: 500000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">
                {errors.price.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Localisation (Ville) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('city')}
              type="text"
              placeholder="Ex: Touba"
              className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">
                {errors.city.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantité
            </label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.quantity.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Détails spécifiques */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">
            Détails de l&apos;animal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Race <span className="text-red-500">*</span></label>
              <input
                {...register('breed')}
                type="text"
                placeholder="Ex: Ladoum, Touabire..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
              />
              {errors.breed && (
                <p className="text-red-500 text-xs mt-1">{errors.breed.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Âge (mois) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('age', { valueAsNumber: true })}
                type="number"
                placeholder="Ex: 12"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1">{errors.age.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Poids (kg) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('weight', { valueAsNumber: true })}
                type="number"
                placeholder="Ex: 150"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sexe</label>
              <select
                {...register('sex')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
              >
                <option value="">Sélectionnez...</option>
                <option value="MALE">Mâle</option>
                <option value="FEMELLE">Femelle</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description détaillée
          </label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Décrivez l'animal en détail, son état de santé, etc."
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message as string}
            </p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-8 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-lg font-bold shadow-md transition-colors disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Préparation...
              </>
            ) : (
              "Publier l'annonce gratuitement"
            )}
          </button>
        </div>
      </form>

      {/* MODAL DE PAIEMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#2D6A4F] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Paiement requis</h3>
              <button onClick={() => setShowPaymentModal(false)} className="hover:bg-white/20 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                La publication d'une annonce coûte <strong className="text-gray-900 text-xl">50 FCFA</strong>. Veuillez choisir votre moyen de paiement pour finaliser la publication.
              </p>
              
              <div className="space-y-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WAVE')}
                  className={`w-full flex items-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'WAVE' ? 'border-[#14B8A6] bg-teal-50' : 'border-gray-200 hover:border-[#14B8A6]'}`}
                >
                  <img src="https://i.imgur.com/3jL3J0X.png" alt="Wave" className="h-8 w-8 rounded mr-4 object-cover" />
                  <span className="font-semibold text-lg flex-1 text-left">Payer avec Wave</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ORANGE_MONEY')}
                  className={`w-full flex items-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'ORANGE_MONEY' ? 'border-[#FF7900] bg-orange-50' : 'border-gray-200 hover:border-[#FF7900]'}`}
                >
                  <div className="h-8 w-8 rounded mr-4 bg-black flex items-center justify-center text-[#FF7900] font-bold">OM</div>
                  <span className="font-semibold text-lg flex-1 text-left">Orange Money</span>
                </button>
              </div>

              <button
                onClick={handlePaymentAndPublish}
                disabled={!paymentMethod || isSubmitting}
                className="w-full py-4 bg-[#D4A843] hover:bg-[#b08b35] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-md transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Traitement en cours...</>
                ) : (
                  "Confirmer le paiement (50 FCFA)"
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Paiement sécurisé. Votre annonce sera publiée immédiatement après validation et restera <strong>visible pendant 15 jours</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
