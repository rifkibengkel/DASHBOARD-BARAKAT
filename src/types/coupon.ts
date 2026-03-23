import { ObjectId } from 'mongodb';

export interface Coupon {
    id: ObjectId;
    coupon: string;
    entriesId: number;
    prizeId: number;
    productId: number;
    status: number;
    filename: string;
    sender: string;
    length: number;
    use_date: Date;
    is_delete: number;
    deleted_at: Date;
    created_at: Date;
    updated_at: Date;
}
