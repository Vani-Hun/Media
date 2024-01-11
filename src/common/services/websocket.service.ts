import { VideoService } from 'src/video/video.service';
// notification.gateway.ts
import { Req } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CustomerService } from 'src/customer/customer.service';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private customerService: CustomerService,
        private VideoService: VideoService) { }

    @WebSocketServer() server: Server;

    handleConnection(client: any, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('like')
    async handleLike(client: any, payload: any): Promise<void> {
        console.log("Client:", client.id)
        console.log('Received customer:', payload);
        const customer = await this.customerService.getUser(payload);
        this.server.to(client.id).emit('updateCustomer', customer);
    }

    @SubscribeMessage('viewVideo')
    async handleViewVideo(client: any, payload: any): Promise<void> {
        console.log("Client:", client.id)
        console.log('Received payload:', payload);
        // const customer = await this.customerService.getUser(payload);
        this.server.to(client.id).emit('updateVideo', payload);
    }
}
