const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME as string;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL as string;
const JWT_SECRET_NAME = process.env.JWT_SECRET_NAME as string;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;
const JWT_EXPIRES = process.env.JWT_EXPIRES as string;

export { APP_NAME, APP_BASE_URL, JWT_SECRET_NAME, JWT_SECRET_KEY, JWT_EXPIRES };
