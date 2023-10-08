// websocket.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('likeVideo')
    handleLikeEvent(client: any, payload: any): void {
        // Xử lý logic khi có sự kiện thích video
        // payload có thể chứa thông tin như videoId, userId, ...
        // Sau khi xử lý, gửi thông báo đến tất cả các kết nối WebSocket
        this.server.emit('likeVideo', payload);
    }
}

