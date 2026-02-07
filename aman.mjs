import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const region = "ap-south-1";

const s3 = new S3Client({
    region,})

const command = new PutObjectCommand({
  Bucket: "nodejs-notes-aws-s3-crud",
  Key: "image4.png",
  ContentType: "image/png", // ✅ FIX
});

    
    const url = await getSignedUrl(
        s3,command,
        {expiresIn:3600,
       signableHeaders: new Set(["content-type"]),


        }

    );

    console.log("Presigned URL:", url);

