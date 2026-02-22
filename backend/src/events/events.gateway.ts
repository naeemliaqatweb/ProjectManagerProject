import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface RoomUser extends User {
  socketId: string;
  projectId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  // In-memory storage for active users in rooms
  private activeUsers: Map<string, RoomUser> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.activeUsers.get(client.id);
    if (user) {
      this.activeUsers.delete(client.id);
      this.broadcastPresence(user.projectId);
      console.log(`Client disconnected: ${client.id} (User: ${user.name})`);
    } else {
      console.log(`Client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string; user: User },
  ) {
    const { projectId, user } = data;

    // Join the room
    client.join(projectId);

    // Track the user
    this.activeUsers.set(client.id, {
      ...user,
      socketId: client.id,
      projectId,
    });

    // Broadcast updated presence list
    this.broadcastPresence(projectId);

    console.log(`User ${user.name} joined project: ${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const { projectId } = data;
    client.leave(projectId);
    this.activeUsers.delete(client.id);
    this.broadcastPresence(projectId);
    console.log(`Client ${client.id} left project: ${projectId}`);
  }

  @SubscribeMessage('editingTask')
  handleEditingTask(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { projectId: string; taskId: string; isEditing: boolean; user: User },
  ) {
    const { projectId, taskId, isEditing, user } = data;
    // Broadcast to everyone else in the project room
    client.to(projectId).emit('userEditingTask', {
      taskId,
      isEditing,
      user,
    });
  }

  @SubscribeMessage('taskMoved')
  handleTaskMoved(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      projectId: string;
      taskId: string;
      fromColumnId?: string;
      toColumnId: string;
    },
  ) {
    const { projectId, taskId, fromColumnId, toColumnId } = data;
    client.to(projectId).emit('taskMovedUpdate', {
      taskId,
      fromColumnId,
      toColumnId,
    });
    console.log(`Task ${taskId} moved in project ${projectId}`);
  }

  @SubscribeMessage('updateTaskTime')
  async handleUpdateTaskTime(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { projectId: string; taskId: string; incrementMinutes: number },
  ) {
    const { projectId, taskId, incrementMinutes } = data;

    // Persist to database
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      const additionalHours = incrementMinutes / 60;
      const newActualHours = (task.actualHours || 0) + additionalHours;

      await this.prisma.task.update({
        where: { id: taskId },
        data: { actualHours: newActualHours },
      });

      // Broadcast update to all clients in the project room
      this.server.to(projectId).emit('taskTimeUpdated', {
        taskId,
        incrementMinutes,
        newActualHours,
      });
      console.log(
        `Task ${taskId} time incremented by ${incrementMinutes}m and saved to DB`,
      );
    }
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    client.join(`user_${userId}`);
    console.log(`Client ${client.id} joined user room: user_${userId}`);
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }

  private broadcastPresence(projectId: string) {
    const usersInProject = Array.from(this.activeUsers.values())
      .filter((u) => u.projectId === projectId)
      .reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [] as User[]);

    this.server.to(projectId).emit('presenceUpdate', usersInProject);
  }
}
