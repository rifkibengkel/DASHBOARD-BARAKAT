import {
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Menu } from "@/types";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.AWS_BUCKET_REGION,
  endpoint: process.env.AWS_BUCKET_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export function buildMenuTree(flatMenu: Menu[]): Menu[] {
  const menuMap = new Map<number, Menu>();
  const rootMenus: Menu[] = [];

  flatMenu.forEach((item) => {
    menuMap.set(item.id, { ...item, children: [] });
  });

  flatMenu.forEach((item) => {
    const menuItem = menuMap.get(item.id)!;

    if (item.level === 1 || item.sub === 0) {
      rootMenus.push(menuItem);
    } else {
      const parent = menuMap.get(item.sub);
      if (parent) {
        parent.children!.push(menuItem);
      }
    }
  });

  return rootMenus;
}

export function appendParams(
  params: URLSearchParams,
  obj: Record<string, unknown>
) {
  Object.entries(obj).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== -1 &&
      value !== "-1"
    ) {
      params.set(key, String(value));
    }
  });
}

export const validateGetS3 = async (key: string) => {
  const getData = await s3Client.send(
    new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    })
  );

  const getImage = (await getData?.Body?.transformToString("base64")) as string;
  const getBuffer = Buffer.from(getImage, "base64");

  return getBuffer;
};

export const validateUploadS3 = async (key: string, image: string) => {
  const getBase64Str = image.substring(image.indexOf(",") + 1);
  const getBuffer = Buffer.from(getBase64Str, "base64");
  const setUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: getBuffer,
      ContentType: "image/jpeg",
      ContentEncoding: "base64",
    },
  });

  return await setUpload.done();
};

export const deleteS3Object = async (key: string) => {
  try {
    // Cek file exist
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
      })
    );

    // Hapus file
    return await s3Client.send(
      new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error: any) {
    if (error.$metadata?.httpStatusCode === 404) {
      console.warn(`File not found: ${key}`);
      return null;
    }
    throw error;
  }
};

export const formatNumber = (value: string | number) => {
  const num = Number(value) || 0;
  return num.toLocaleString();
};

export const getShipmentColor = (status?: number) => {
  switch (status) {
    case 1:
      return "info";
    case 2:
      return "info";
    case 3:
      return "success";
    default:
      return "warning";
  }
};

export const getStatusColor = (status?: number) => {
  switch (status) {
    case 1:
      return "warning";
    case 2:
      return "success";
    case 3:
      return "error";
    default:
      return "warning";
  }
};

export const getApprovedColor = (status?: number) => {
  switch (status) {
    case 1:
      return "success";
    case 2:
      return "error";
    default:
      return "warning";
  }
};

export const getValidColor = (isValid?: number, status?: number) => {
  // Jika isvalid = 1 dan status = 2 atau 3 (process)
  if (isValid === 1 && (status === 2 || status === 3)) {
    return "warning";
  }

  // Jika isvalid = 1 dan status = 1 (valid)
  if (isValid === 1 && status === 1) {
    return "success";
  }

  return isValid === 0 ? "error" : "warning";
};

export const randomString = async (length: number, chars: string) => {
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

export function formatToIDR(balance: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(balance);
}

export const getBase64 = (file: Blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const customFilename = (sender: string) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let unixChars = "";
  const timestamp = new Date().getTime();
  for (let i = 0; i < 5; i++) {
    unixChars += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${sender}_${unixChars}_${timestamp}`;
};

export const disabledTextBlack = {
  // Untuk input text di DatePicker
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input": {
    WebkitTextFillColor: "rgba(0,0,0,0.7)",
  },

  // Untuk label
  "& .MuiInputLabel-root.Mui-disabled": {
    color: "rgba(0,0,0,0.7)",
  },

  // Untuk icon calendar disabled
  "& .MuiSvgIcon-root": {
    color: "rgba(0,0,0,0.5)",
  },
};
