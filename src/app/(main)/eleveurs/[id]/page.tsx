'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MapPin, ShieldCheck, User, Loader2, Star, MessageSquare, Phone } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: { url: string }[];
  category: { name: string };
  city: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface EleveurProfile {
  id: string;
  name: string;
  avatar: string | null;
  location: string | null;
  phone: string | null;
  verified: boolean;
  bio: string | null;
  _count: { listings: number; reviewsReceived: number };
  averageRating: number;
  listings: Listing[];
}

export default function EleveurProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [eleveur, setEleveur] = useState<EleveurProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'annonces' | 'avis'>('annonces');
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, reviewsRes] = await Promise.all([
        fetch(`/api/eleveurs/${params?.id}`),
        fetch(`/api/eleveurs/${params?.id}/reviews`)
      ]);
      
      if (profileRes.ok) {
        setEleveur(await profileRes.json());
      }
      if (reviewsRes.ok) {
        setReviews(await reviewsRes.json());
      }
    } catch (error) {
      console.error('Error fetching eleveur data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchProfileData();
    }
  }, [params?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setSubmittingReview(true);
    setReviewError('');
    
    try {
      const res = await fetch(`/api/eleveurs/${params?.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });
      
      if (res.ok) {
        setComment('');
        setRating(5);
        fetchProfileData(); // Refresh data
      } else {
        const errorData = await res.json();
        setReviewError(errorData.error || 'Erreur lors de la soumission de l\'avis');
      }
    } catch (error) {
      setReviewError('Erreur de connexion');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStartChat = async () => {
    if (!session || !eleveur) return;
    setIsStartingChat(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: eleveur.id })
      });
      if (res.ok) {
        // Rediriger vers la messagerie avec l'ID de la conversation si possible,
        // ou simplement vers le tableau de bord / messages
        router.push('/tableau-de-bord/messages');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (!eleveur) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Éleveur non trouvé</h1>
        <Link href="/eleveurs" className="text-[#2D6A4F] hover:underline mt-4 inline-block">
          Retour à l'annuaire
        </Link>
      </div>
    );
  }

  // Vérifier si l'utilisateur connecté est le propriétaire du profil
  const isOwner = session?.user?.id === eleveur.id;

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FAFAF5] min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-4 border-white shadow-md">
            {eleveur.avatar ? (
              <img src={eleveur.avatar} alt={eleveur.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#2D6A4F] text-white">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start mb-2">
              {eleveur.name}
              {eleveur.verified && <ShieldCheck className="w-6 h-6 text-[#D4A843] ml-2" />}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600 mb-4">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {eleveur.location || 'Lieu non spécifié'}
              </span>
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-[#D4A843] fill-[#D4A843]" />
                {eleveur.averageRating > 0 ? eleveur.averageRating : 'Nouveau'} 
                <span className="text-sm ml-1">({eleveur._count.reviewsReceived} avis)</span>
              </span>
            </div>

            {eleveur.bio && (
              <p className="text-gray-700 max-w-2xl mx-auto md:mx-0">{eleveur.bio}</p>
            )}
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
            {session ? (
              !isOwner && (
                <div className="space-y-3 w-full md:w-auto">
                  <button 
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className="w-full md:w-auto bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center disabled:bg-gray-400"
                  >
                    {isStartingChat ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MessageSquare className="w-5 h-5 mr-2" />}
                    Contacter
                  </button>
                  {eleveur.phone && (
                    <a 
                      href={`tel:${eleveur.phone.replace(/\s+/g, '')}`} 
                      className="w-full md:w-auto bg-[#D4A843] hover:bg-[#b08b35] text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {eleveur.phone}
                    </a>
                  )}
                </div>
              )
            ) : (
              <Link href="/connexion">
                <button className="w-full md:w-auto bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center">
                  Se connecter pour contacter
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('annonces')}
          className={`py-4 px-6 font-medium text-lg border-b-2 transition-colors ${
            activeTab === 'annonces' 
              ? 'border-[#2D6A4F] text-[#2D6A4F]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Annonces ({eleveur._count.listings})
        </button>
        <button
          onClick={() => setActiveTab('avis')}
          className={`py-4 px-6 font-medium text-lg border-b-2 transition-colors ${
            activeTab === 'avis' 
              ? 'border-[#2D6A4F] text-[#2D6A4F]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Avis ({eleveur._count.reviewsReceived})
        </button>
      </div>

      {/* Tab Content: Annonces */}
      {activeTab === 'annonces' && (
        <div>
          {eleveur.listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {eleveur.listings.map((listing) => (
                <Link href={`/annonces/${listing.id}`} key={listing.id}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="h-48 bg-gray-200 relative">
                      {listing.images?.[0]?.url ? (
                        <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          Sans image
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold text-[#2D6A4F]">
                        {listing.category.name}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
                      <p className="text-xl font-bold text-[#D4A843] mb-2">
                        {listing.price.toLocaleString()} {listing.currency}
                      </p>
                      {listing.city && (
                        <div className="flex items-center text-gray-500 text-sm mt-auto">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.city}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">Cet éleveur n'a aucune annonce active pour le moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Avis */}
      {activeTab === 'avis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-3">
                      {review.reviewer.avatar ? (
                        <img src={review.reviewer.avatar} alt={review.reviewer.name || 'Utilisateur'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.reviewer.name || 'Utilisateur anonyme'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-[#D4A843] fill-[#D4A843]' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500">Aucun avis pour le moment.</p>
              </div>
            )}
          </div>

          <div>
            {session ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Laisser un avis</h3>
                
                {reviewError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-4 text-sm border border-red-200">
                    {reviewError}
                  </div>
                )}
                
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              rating >= star ? 'text-[#D4A843] fill-[#D4A843]' : 'text-gray-300 hover:text-gray-400'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire</label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] resize-none"
                      placeholder="Partagez votre expérience avec cet éleveur..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publier l\'avis'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#E9F5F0] p-6 rounded-xl border border-[#C5E1D4] text-center sticky top-24">
                <h3 className="text-lg font-bold text-[#2D6A4F] mb-2">Donnez votre avis</h3>
                <p className="text-[#1B4332] text-sm mb-4">Connectez-vous pour partager votre expérience avec cet éleveur.</p>
                <Link href="/connexion">
                  <button className="w-full bg-white text-[#2D6A4F] border border-[#2D6A4F] hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors">
                    Se connecter
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
