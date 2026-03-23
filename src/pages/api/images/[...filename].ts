import { NextApiRequest, NextApiResponse } from 'next';
import { validateGetS3 } from '@/lib/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const image: string | string[] | null = req.query.filename ? req.query.filename : null;
    const imagePath = Array.isArray(image) ? image.join('/') : image ?? '';
    const getImage = await validateGetS3(imagePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(getImage);
};

export default handler;
