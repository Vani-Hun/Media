import { BaseEntityUUID } from "src/common/entities/base.entity";
import { Customer } from "src/customer/customer.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class Payment extends BaseEntityUUID {
    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'user' })
    user: Customer;

    @Column()
    vnp_amount: string;
    @Column()
    vnp_bank_code: string;
    @Column()
    vnp_card_type: string;
    @Column()
    vnp_order_info: string;
    @Column()
    vnp_pay_date: Date;
    @Column()
    vnp_response_code: string;
    @Column()
    vnp_tmn_code: string;
    @Column()
    vnp_transaction_no: number;
    @Column()
    vnp_transaction_status: string;
    @Column()
    vnp_txn_ref: number;
    @Column()
    vnp_message: string;

}
