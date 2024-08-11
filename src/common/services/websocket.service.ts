import { AdminService } from 'src/admin/admin.service';
import { ConversationService } from './../../conversation/conversation.service';
import { MessageService } from './../../message/message.service';
import { VideoService } from 'src/video/video.service';
import { HttpException, HttpStatus, Req } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CustomerService } from 'src/customer/customer.service';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private customerService: CustomerService,
        private videoService: VideoService,
        private conversationService: ConversationService,
        private adminService: AdminService
    ) { }
    private userMap = []

    @WebSocketServer() server: Server;

    handleConnection(client: any, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }


    handleDisconnect(client: any) {
        // console.log(`Client disconnected: ${client.id}`);
        this.userMap = this.userMap.filter(user => user.clientId !== client.id);
    }

    @SubscribeMessage('userConnected')
    userConnected(client: any, payload: any): void {
        this.userMap = this.userMap.filter(user => user.clientId !== client.id);
        const user = {
            clientId: client.id,
            customerId: payload.customerId
        }
        this.userMap.push(user)
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(client: any, payload: any): Promise<void> {
        try {
            const recieverId = this.userMap.find(user => user.customerId === payload.receiverId)
            payload.id = payload.receiverId
            let isExistAdmin = await this.adminService.getAdminByAdmin(payload)
            console.log("isExistAdmin:", isExistAdmin)
            if (isExistAdmin.admin) {
                await this.conversationService.createConversationWithAdmin(payload)
            } else {
                await this.conversationService.createConversation(payload)
            }

            if (recieverId) {
                this.server.to(recieverId.clientId).emit('sendMessage', payload.mess);
            }
            return payload
        } catch (err) {
            console.log("err:", err)
            throw new HttpException('Failed.', HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @SubscribeMessage('adminSendMessage')
    async adminSendMessage(client: any, payload: any): Promise<void> {
        try {
            const recieverId = this.userMap.find(user => user.customerId === payload.receiverId)
            await this.conversationService.createConversationWithAdmin(payload)
            if (recieverId) {
                this.server.to(recieverId.clientId).emit('sendMessage', payload.mess);
            }
            return payload
        } catch (err) {
            console.log("err:", err)
            throw new HttpException('Failed.', HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @SubscribeMessage('updateMessages')
    async updateMessages(client: any, payload: any): Promise<void> {
        let getList = await this.conversationService.getListContact(payload)
        this.server.to(client.id).emit('updateMessages', getList);
    }

    @SubscribeMessage('updateMessagesAdmin')
    async updateMessagesAdmin(client: any, payload: any): Promise<void> {
        let getList = await this.conversationService.getListContactForAdmin(payload)
        this.server.to(client.id).emit('updateMessagesAdmin', getList);
    }

    @SubscribeMessage('updateMessage')
    async updateMessage(client: any, payload: any): Promise<void> {
        const getContact = await this.conversationService.getContact(payload)
        this.server.to(client.id).emit('updateMessage', getContact);
    }

    @SubscribeMessage('updateCustomer')
    async updateCustomer(client: any, payload: any): Promise<void> {
        const customer = await this.customerService.getUser(payload);
        this.server.to(client.id).emit('updateCustomer', customer);
    }

    @SubscribeMessage('updateVideo')
    async updateVideo(client: any, payload: any): Promise<void> {
        const video = await this.videoService.getVideo(payload);
        this.server.to(client.id).emit('updateVideo', video);
    }
}
