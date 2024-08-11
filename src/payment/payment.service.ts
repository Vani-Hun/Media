import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { Payment } from './payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import request from 'request';
import { ConfigService } from '@nestjs/config';
let querystring = require('qs');

import axios from 'axios';

export const vnpayConfig = {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    vnpUrl: process.env.VNPAY_URL,
    returnUrl: process.env.VNPAY_RETURN_URL,
};
interface VnpayParams {
    vnp_Version: string;
    vnp_Command: string;
    vnp_TmnCode: string;
    vnp_Locale: string;
    vnp_CurrCode: string;
    vnp_TxnRef: string;
    vnp_OrderInfo: string;
    vnp_OrderType: string;
    vnp_Amount: number;
    vnp_ReturnUrl: string;
    vnp_IpAddr: string;
    vnp_CreateDate: string;
    vnp_BankCode?: string;
}
const VNP_VERSION = '2.1.0';
const VNP_COMMAND_PAY = 'pay';
const VNP_COMMAND_QUERY = 'querydr';
@Injectable()
export class PaymentService extends BaseService<Payment> {
    private readonly logger = new Logger(PaymentService.name);
    constructor(
        @InjectRepository(Payment) repo: Repository<Payment>,
        private readonly configService: ConfigService
    ) {
        super(repo);
    }

    async savePaymentTransaction(vnpParams: any, user: any): Promise<Payment> {
        try {
            return await this.repo.save(this.repo.create({
                user: user.id,
                vnp_amount: vnpParams['vnp_Amount'],
                vnp_bank_code: vnpParams['vnp_BankCode'],
                vnp_card_type: vnpParams['vnp_CardType'],
                vnp_order_info: vnpParams['vnp_OrderInfo'],
                vnp_pay_date: vnpParams['vnp_PayDate'],
                vnp_response_code: vnpParams['vnp_ResponseCode'],
                vnp_tmn_code: vnpParams['vnp_TmnCode'],
                vnp_transaction_no: vnpParams['vnp_TransactionNo'],
                vnp_transaction_status: vnpParams['vnp_TransactionStatus'],
                vnp_txn_ref: vnpParams['vnp_TxnRef'],
                vnp_message: vnpParams['vnp_Message'],
            }));
        } catch (error) {
            this.logger.error(`Failed to save payment transaction: ${error.message}`, error.stack);
            throw new HttpException(`Failed to save payment transaction: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    createPaymentUrl(orderId: string, amount: number, orderInfo: string, ipAddr: string, bankCode: string): string {
        try {
            const date = new Date();
            const createDate = moment(date).format('YYYYMMDDHHmmss');

            const vnpParams: VnpayParams = {
                vnp_Version: VNP_VERSION,
                vnp_Command: VNP_COMMAND_PAY,
                vnp_TmnCode: this.configService.get<string>('VNPAY_TMN_CODE'),
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: 'other',
                vnp_Amount: amount * 100,
                vnp_ReturnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate,
            };

            if (bankCode) {
                vnpParams.vnp_BankCode = bankCode;
            }

            const sortedParams = this.sortObject(vnpParams);
            const signData = querystring.stringify(sortedParams, { encode: false });
            const secureHash = this.createSecureHash(signData);

            sortedParams['vnp_SecureHash'] = secureHash;
            return `${this.configService.get<string>('VNPAY_URL')}?${querystring.stringify(sortedParams, { encode: false })}`;
        } catch (error) {
            this.logger.error(`Error in createPaymentUrl: ${error.message}`, error.stack);
            throw new HttpException(`Error in createPaymentUrl: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    verifyReturnUrl(vnpParams: any): boolean {
        const secureHash = vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        const sortedParams = this.sortObject(vnpParams);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const calculatedHash = this.createSecureHash(signData);

        return secureHash === calculatedHash;
    }

    async createQueryDR(orderId: string, transDate: string, ipAddr: string): Promise<any> {
        try {
            const date = new Date();
            process.env.TZ = 'Asia/Ho_Chi_Minh';

            const vnp_RequestId = moment(date).format('HHmmss');
            const vnp_Version = '2.1.0';
            const vnp_Command = 'querydr';
            const vnp_TmnCode = this.configService.get<string>('VNPAY_TMN_CODE');
            const vnp_TxnRef = orderId;
            const vnp_OrderInfo = `Truy van GD ma:${vnp_TxnRef}`;
            const vnp_TransactionDate = moment(transDate, 'DD/MM/YYYY HH:mm:ss').format('YYYYMMDDHHmmss');
            const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
            const vnp_IpAddr = ipAddr || '127.0.0.1'; // Đảm bảo luôn có giá trị
            const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
            const vnp_Api = this.configService.get<string>('VNPAY_API_URL');

            const data = `${vnp_RequestId}|${vnp_Version}|${vnp_Command}|${vnp_TmnCode}|${vnp_TxnRef}|${vnp_TransactionDate}|${vnp_CreateDate}|${vnp_IpAddr}|${vnp_OrderInfo}`;

            const hmac = crypto.createHmac("sha512", secretKey);
            const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");

            const dataObj = {
                vnp_RequestId,
                vnp_Version,
                vnp_Command,
                vnp_TmnCode,
                vnp_TxnRef,
                vnp_OrderInfo,
                vnp_TransactionDate,
                vnp_CreateDate,
                vnp_IpAddr,
                vnp_SecureHash
            };

            this.logger.debug(`Sending request to VNPay API:`);
            this.logger.debug(`URL: ${vnp_Api}`);
            this.logger.debug(`Body: ${JSON.stringify(dataObj)}`);

            const response = await axios.post(vnp_Api, dataObj, {
                headers: { 'Content-Type': 'application/json' }
            });

            this.logger.debug(`VNPay API Response: ${JSON.stringify(response.data)}`);

            return response.data;
        } catch (error) {
            this.logger.error(`Error in createQueryDR: ${error.message}`, error.stack);
            throw new HttpException(`Error in createQueryDR: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkPaymentExist(vnpParams, user): Promise<boolean> {
        console.log("vnpParams:", vnpParams)
        try {
            let payment = await this.repo.createQueryBuilder('payment')
                .where('payment.vnp_transaction_no = :vnp_transaction_no', { vnp_transaction_no: vnpParams['vnp_TransactionNo'] })
                .andWhere('payment.user = :user', { user: user.id })
                .andWhere('payment.vnp_bank_code = :vnp_bank_code', { vnp_bank_code: vnpParams['vnp_BankCode'] })
                .andWhere('payment.vnp_card_type = :vnp_card_type', { vnp_card_type: vnpParams['vnp_CardType'] })
                .getOne();
            console.log("payment:", payment)
            return !!payment;
        } catch (error) {
            console.error(`Error in getUser: ${error.message}`);
            throw new HttpException('Error in getUser.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    private sortObject(obj: any): any {
        const sorted = {};
        const str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }

    private createSecureHash(data: string): string {
        const hmac = crypto.createHmac('sha512', this.configService.get<string>('VNPAY_HASH_SECRET'));
        return hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
    }
    verifyIPN(vnpParams: any): boolean {
        const secureHash = vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        const sortedParams = this.sortObject(vnpParams);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        return secureHash === signed
    }
}