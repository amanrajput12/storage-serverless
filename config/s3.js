
import { PutObjectCommand,S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const region = "ap-south-1";

const s3 = new S3Client({
    region,})

    export const createuploadSignedUrl = async (key,contentType)=>{
        console.log("key in ss",key)
    

        const command = new PutObjectCommand({
            Bucket: "nodejs-notes-aws-s3-crud",
            Key: key,
            ContentType: contentType, // ✅ FIX
          });

            const url = await getSignedUrl(s3, command,
                 { expiresIn: 300
                ,signableHeaders: new Set(["content-type"]),
                 });

                 console.log("Presigned URL in s3:", url);
            return url;
    }

