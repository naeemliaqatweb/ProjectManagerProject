import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinTask')
  handleJoinTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`task-${taskId}`);
    return { event: 'joinedTask', data: taskId };
  }

  @SubscribeMessage('leaveTask')
  handleLeaveTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`task-${taskId}`);
    return { event: 'leftTask', data: taskId };
  }
}
