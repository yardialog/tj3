import { createServer } from 'http';
import { Server } from 'socket.io';
import { db } from '../../src/lib/db';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const httpServer = createServer();

const io = new Server(httpServer, {
  path: '/socket.io',
  cors: {
    origin: ['http://localhost:3000', '*'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

interface UserSockets {
  [userId: string]: string[];
}

const userSockets: UserSockets = {};

// Authentication middleware
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error('Authentication error'));
  }
  socket.data.userId = userId;
  next();
});

io.on('connection', async (socket) => {
  const userId = socket.data.userId;
  console.log(`User ${userId} connected`);

  // Track user sockets
  if (!userSockets[userId]) {
    userSockets[userId] = [];
  }
  userSockets[userId].push(socket.id);

  try {
    // Get user to determine role
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    let rooms: { id: string }[] = [];

    if (user.role === 'TEENAGER') {
      // Teenager: teenagerId in ChatRoom is the userId
      rooms = await db.chatRoom.findMany({
        where: { teenagerId: userId },
        select: { id: true },
      });
    } else if (user.role === 'EMPLOYER') {
      // Employer: employerId in ChatRoom is EmployerProfile.id, not userId!
      const employerProfile = await db.employerProfile.findUnique({
        where: { userId: userId },
        select: { id: true },
      });
      
      if (employerProfile) {
        rooms = await db.chatRoom.findMany({
          where: { employerId: employerProfile.id },
          select: { id: true },
        });
      }
    }

    console.log(`User ${userId} joining ${rooms.length} rooms`);
    
    rooms.forEach((room) => {
      socket.join(room.id);
    });
  } catch (error) {
    console.error('Error joining rooms:', error);
  }

  // Handle sending messages
  socket.on('send_message', async (data: { roomId: string; content: string; receiverId: string }) => {
    try {
      // Check for contact info masking
      const maskedContent = maskContactInfo(data.content);
      
      // Save message to database
      const message = await db.chatMessage.create({
        data: {
          roomId: data.roomId,
          senderId: userId,
          receiverId: data.receiverId,
          content: maskedContent,
          isRead: false,
        },
      });

      // Update chat room
      await db.chatRoom.update({
        where: { id: data.roomId },
        data: { updatedAt: new Date() },
      });

      console.log(`Message saved: ${message.id} in room ${data.roomId}`);

      // Emit to room
      io.to(data.roomId).emit('receive_message', message);

      // Send notification to receiver if not in room
      const receiverSockets = userSockets[data.receiverId] || [];
      const receiverInRoom = receiverSockets.some(sid => {
        const s = io.sockets.sockets.get(sid);
        return s && s.rooms.has(data.roomId);
      });

      if (!receiverInRoom && receiverSockets.length > 0) {
        receiverSockets.forEach(sid => {
          io.to(sid).emit('notification', {
            type: 'NEW_MESSAGE',
            roomId: data.roomId,
            message,
          });
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Ошибка при отправке сообщения' });
    }
  });

  // Handle manual room join (used by frontend)
  socket.on('join_room', (data: { roomId: string }) => {
    socket.join(data.roomId);
    console.log(`User ${userId} manually joined room ${data.roomId}`);
  });

  // Handle typing indicator
  socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
    socket.to(data.roomId).emit('user_typing', {
      userId,
      isTyping: data.isTyping,
    });
  });

  // Handle marking messages as read
  socket.on('mark_read', async (data: { roomId: string }) => {
    try {
      await db.chatMessage.updateMany({
        where: {
          roomId: data.roomId,
          receiverId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      io.to(data.roomId).emit('messages_read', {
        roomId: data.roomId,
        readBy: userId,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
    if (userSockets[userId]) {
      userSockets[userId] = userSockets[userId].filter(id => id !== socket.id);
      if (userSockets[userId].length === 0) {
        delete userSockets[userId];
      }
    }
  });
});

// Mask contact info in messages
function maskContactInfo(text: string): string {
  // Mask phone numbers
  text = text.replace(
    /(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g,
    '[телефон скрыт]'
  );
  
  // Mask emails
  text = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[email скрыт]'
  );
  
  // Mask social media links
  text = text.replace(
    /(?:vk\.com|instagram\.com|t\.me|telegram\.me)\/[a-zA-Z0-9_]+/gi,
    '[соц. сеть скрыта]'
  );
  
  return text;
}

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});
