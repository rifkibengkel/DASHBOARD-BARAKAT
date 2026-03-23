import { getMongoDatabase } from '@/lib/db/mongo';
import { Coupon } from '@/types/coupon';

export async function getCouponByName(filter: Partial<Coupon> = {}): Promise<Coupon[]> {
    const db = await getMongoDatabase();

    try {
        const coupons = await db.collection<Coupon>('coupon').find(filter).toArray();
        return coupons;
    } catch (error) {
        console.error('Error finding coupons:', error);
        throw new Error('Failed to find coupons');
    }
}
