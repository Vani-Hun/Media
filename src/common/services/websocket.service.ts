// notification.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CustomerService } from 'src/customer/customer.service';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(customerService: CustomerService) { }

    @WebSocketServer() server: Server;

    handleConnection(client: any, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('like')
    handleLike(client: any, payload: any): void {
        console.log("client===============================:", client.id)
        console.log('Received like=======================================:', payload);

        // Thực hiện xử lý khi có sự kiện like
        const recipientId = payload.recipientId; // Điều này phải được đặt từ phía client khi gửi sự kiện 'like'

        // Gửi thông báo cho người nhận cụ thể
        this.server.to(recipientId).emit('notification', { message: 'Someone liked your video!' });
    }


    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendNotification')
    handleSendNotification(client: any, payload: any): void {
        // Handle the notification payload and send it to the client
        this.server.emit('notification', payload);
    }
}
