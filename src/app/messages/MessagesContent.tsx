'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  CheckCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  teenagerId: string;
  employerId: string;
  isActive: boolean;
  updatedAt: string;
  application: {
    vacancy: {
      id: string;
      title: string;
    };
  };
  messages: Message[];
  employer?: {
    companyName: string;
    userId: string;
  };
  teenager?: {
    id: string;
    email: string;
    teenager: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuthStore();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; type: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // HTTP polling is always "connected"

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!selectedRoom) return;

    try {
      const params = new URLSearchParams({
        roomId: selectedRoom.id,
        ...(lastMessageIdRef.current ? { afterId: lastMessageIdRef.current } : {}),
      });

      const res = await fetch(`/api/chat/messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = data.messages.filter((m: Message) => !existingIds.has(m.id));
            if (newMessages.length > 0) {
              lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
            }
            return [...prev, ...newMessages];
          });
          setTimeout(scrollToBottom, 100);
        }
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error polling messages:', error);
      setIsConnected(false);
    }
  }, [selectedRoom, scrollToBottom]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'ADMIN') {
      router.push('/admin');
    } else if (user) {
      fetchRooms();
    }
  }, [user, authLoading, router, fetchRooms]);

  // Open room from URL param
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        handleSelectRoom(room.id);
      }
    }
  }, [searchParams, rooms]);

  // Start polling when room is selected
  useEffect(() => {
    if (selectedRoom) {
      // Initial load
      pollMessages();

      // Poll every 2 seconds
      pollingIntervalRef.current = setInterval(pollMessages, 2000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedRoom, pollMessages]);

  // Scroll when messages are loaded
  useEffect(() => {
    if (messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, scrollToBottom]);

  const handleSelectRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat?roomId=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRoom(data.room);
        setOtherUser(data.otherUser);
        setMessages(data.room.messages || []);
        if (data.room.messages?.length > 0) {
          lastMessageIdRef.current = data.room.messages[data.room.messages.length - 1].id;
        }
        router.push(`/messages?room=${roomId}`);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !otherUser || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          content,
          receiverId: otherUser.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        lastMessageIdRef.current = data.message.id;
        setTimeout(scrollToBottom, 100);
        fetchRooms(); // Update room list
      } else {
        const error = await res.json();
        console.error('Send error:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (authLoading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex h-full">
        {/* Rooms List */}
        <div className={`w-full md:w-80 border-r flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Сообщения
            </h2>
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" title="Подключено" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" title="Нет подключения" />
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>У вас пока нет чатов</p>
                <p className="text-sm mt-1">Чаты появятся после принятия заявки</p>
              </div>
            ) : (
              <div className="divide-y">
                {rooms.map((room) => {
                  const lastMessage = room.messages[0];
                  const otherName = user.role === 'TEENAGER'
                    ? room.employer?.companyName
                    : room.teenager?.teenager
                      ? `${room.teenager.teenager.firstName} ${room.teenager.teenager.lastName}`
                      : room.teenager?.email;

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedRoom?.id === room.id ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {user.role === 'TEENAGER' ? (
                            <Building2 className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{otherName}</span>
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatTime(lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {room.application.vacancy.title}
                          </p>
                          {lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {lastMessage.senderId === user.id ? 'Вы: ' : ''}
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedRoom ? 'flex' : 'hidden md:flex'}`}>
          {!isConnected && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm text-center">
              Переподключение...
            </div>
          )}
          {selectedRoom && otherUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => {
                    setSelectedRoom(null);
                    router.push('/messages');
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {otherUser.type === 'employer' ? (
                    <Building2 className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{otherUser.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {selectedRoom.application.vacancy.title}
                  </div>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    онлайн
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user.id;
                    const showDate = index === 0 ||
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center text-xs text-muted-foreground my-4">
                            {formatDate(message.createdAt)}
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span className="text-xs">{formatTime(message.createdAt)}</span>
                              {isOwn && (
                                <CheckCheck className={`h-3 w-3 ${message.isRead ? 'text-blue-400' : ''}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isConnected ? "Напишите сообщение..." : "Подключение..."}
                    disabled={isSending || !selectedRoom.isActive}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending || !selectedRoom.isActive}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                {!selectedRoom.isActive && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Чат закрыт
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Выберите чат для начала общения</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default MessagesContent;
