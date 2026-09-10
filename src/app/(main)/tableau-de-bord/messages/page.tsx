'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon } from 'lucide-react';
import AudioRecorder from '@/components/chat/AudioRecorder';

interface User {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string | null;
  audioUrl: string | null;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant1: User;
  participant2: User;
  listing?: { id: string; title: string; images: { url: string }[] };
  messages: Message[];
  lastMessageAt: string;
}
import { useSearchParams } from 'next/navigation';

export default function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetListingId = searchParams.get('listing');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialiser socket.io
  useEffect(() => {
    // URL relative pour Next.js (même domaine)
    const socketIo = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('Connecté au serveur WebSocket');
    });

    // À adapter selon la logique de votre serveur (si vous implémentez un événement de réception)
    // socketIo.on('new_message', (message: Message) => {
    //   if (message.conversationId === activeConversationId) {
    //     setMessages(prev => [...prev, message]);
    //   }
    // });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  // Charger les conversations
  useEffect(() => {
    const initConversations = async () => {
      try {
        let createdConversationId = null;
        
        // 1. Si on vient d'un bouton "Contacter", on crée/récupère la conversation d'abord
        if (targetUserId && targetUserId !== session?.user?.id) {
          const createRes = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId, listingId: targetListingId })
          });
          if (createRes.ok) {
            const newConv = await createRes.json();
            createdConversationId = newConv.id;
          }
        }

        // 2. Charger toutes les conversations
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          
          if (createdConversationId) {
            setActiveConversationId(createdConversationId);
          } else if (data.length > 0 && !activeConversationId) {
            setActiveConversationId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Erreur chargement conversations:', error);
      }
    };

    if (session?.user?.id) {
      initConversations();
    }
  }, [session, targetUserId, targetListingId]);

  // Si on change de conversation, on charge l'historique complet des messages
  // On utilise un polling simple (toutes les 5 secondes) car Socket.io n'est pas fiable sur App Router
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchMessages = async () => {
      if (!activeConversationId) return;
      try {
        const res = await fetch(`/api/messages?conversationId=${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          // Seulement mettre à jour si la longueur a changé ou le dernier message est différent pour éviter des re-renders constants
          setMessages((prev) => {
             if (prev.length !== data.length || (prev.length > 0 && prev[prev.length - 1].id !== data[data.length - 1].id)) {
                return data;
             }
             return prev;
          });
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error);
      }
    };

    if (activeConversationId) {
      setMessages([]); // reset local messages while loading
      fetchMessages();
      intervalId = setInterval(fetchMessages, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeConversationId]);

  // Scroll automatique en bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const userId = session?.user?.id;

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participant1.id === userId ? conv.participant2 : conv.participant1;
  };

  const handleSendMessage = async (e?: React.FormEvent, content?: string, audioUrl?: string) => {
    if (e) e.preventDefault();

    const finalContent = content !== undefined ? content : newMessage;
    
    if (!finalContent.trim() && !audioUrl) return;
    if (!activeConversationId) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content: finalContent.trim() || null,
          audioUrl: audioUrl || null
        })
      });

      if (res.ok) {
        const message = await res.json();
        // Ajouter localement
        setMessages(prev => [...prev, message]);
        // Vider l'input text
        setNewMessage('');
        
        // (Optionnel) Émettre via Socket.io si le serveur le relaie aux autres dans la room
        // socket?.emit('send_message', message);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleAudioReady = (audioUrl: string) => {
    handleSendMessage(undefined, undefined, audioUrl);
  };

  if (!session) {
    return <div className="p-8 text-center">Veuillez vous connecter pour voir vos messages.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">Aucune conversation</p>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherParticipant(conv);
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-100 transition ${isActive ? 'bg-green-50 border-l-4 border-l-green-600' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-gray-900 truncate">{otherUser.name || 'Utilisateur inconnu'}</p>
                      {conv.listing && (
                        <p className="text-xs text-green-600 truncate">{conv.listing.title}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Header chat */}
            <div className="p-4 border-b flex items-center shadow-sm z-10">
              <div className="font-semibold text-lg text-gray-800">
                {getOtherParticipant(activeConversation).name || 'Utilisateur'}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {/* Combine l'historique récent des conversations (qui vient du GET conversations) et les nouveaux messages */}
              {/* Note: Dans un vrai contexte, faire un fetch de tous les messages de la conversation */}
              {[...(activeConversation.messages || []), ...messages]
                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Supprimer doublons
                .map((msg) => {
                const isMe = msg.senderId === userId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'
                    }`}>
                      {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      {msg.audioUrl && (
                        <audio controls src={msg.audioUrl} className="mt-2 max-w-full h-10" />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez un message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                
                <AudioRecorder onAudioReady={handleAudioReady} />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
}
