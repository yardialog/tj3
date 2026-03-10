'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
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
  Circle,
  CheckCheck
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { io, Socket } from 'socket.io-client';

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
    userId: string;
    companyName: string;
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
  const [isTyping, setIsTyping] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedRoomRef = useRef<ChatRoom | null>(null);

  // Keep selectedRoomRef in sync
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

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

  // Initialize socket only once
  useEffect(() => {
    if (user) {
      // Determine socket URL based on environment
      const isDev = window.location.hostname === 'localhost' && window.location.port === '3000';
      
      if (isDev) {
        // Sandbox environment - use XTransformPort
        socketRef.current = io('/?XTransformPort=3003', {
          auth: { userId: user.id },
          transports: ['websocket', 'polling'],
        });
      } else {
        // Production - use standard socket.io path
        socketRef.current = io({
          path: '/socket.io',
          auth: { userId: user.id },
          transports: ['websocket', 'polling'],
        });
      }

      socketRef.current.on('connect', () => {
        console.log('Connected to chat server');
      });

      socketRef.current.on('receive_message', (message: Message) => {
        console.log('Received message:', message, 'Current room:', selectedRoomRef.current?.id);
        if (selectedRoomRef.current?.id === message.roomId) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
          // Scroll to bottom when receiving a new message
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
        fetchRooms();
      });

      socketRef.current.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== user.id) {
          setIsTyping(data.isTyping);
        }
      });

      socketRef.current.on('messages_read', () => {
        setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user, fetchRooms]);

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

  // Scroll to bottom when room is first opened
  useEffect(() => {
    if (selectedRoom?.id) {
      setShouldScrollToBottom(true);
    }
  }, [selectedRoom?.id]);

  // Scroll when messages are loaded
  useEffect(() => {
    if (messages.length > 0 && shouldScrollToBottom) {
      setTimeout(() => {
        scrollToBottom();
        setShouldScrollToBottom(false);
      }, 100);
    }
  }, [messages.length, shouldScrollToBottom, scrollToBottom]);

  const handleSelectRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat?roomId=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRoom(data.room);
        setOtherUser(data.otherUser);
        setMessages(data.room.messages || []);
        
        socketRef.current?.emit('join_room', { roomId });
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

    socketRef.current?.emit('send_message', {
      roomId: selectedRoom.id,
      content,
      receiverId: otherUser.id,
    });

    socketRef.current?.emit('typing', {
      roomId: selectedRoom.id,
      isTyping: false,
    });

    setIsSending(false);
  };

  const handleTyping = () => {
    if (!selectedRoom) return;
    
    socketRef.current?.emit('typing', {
      roomId: selectedRoom.id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', {
        roomId: selectedRoom.id,
        isTyping: false,
      });
    }, 2000);
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
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Сообщения
            </h2>
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
                {isTyping && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Circle className="h-2 w-2 fill-current animate-pulse" />
                    Печатает...
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
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Напишите сообщение..."
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
