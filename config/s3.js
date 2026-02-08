
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand,S3Client } from "@aws-sdk/client-s3";
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


 export const createGetSignedUrl = async ({ key,download=false,filename }) => {
  console.log("FINAL key used for S3:", key,filename);

  const command = new GetObjectCommand({
    Bucket: "nodejs-notes-aws-s3-crud",
    Key: key, // ✅ MUST come from argument
    ResponseContentDisposition:`${download ? "attachment" : "inline"}; filename="${encodeURIComponent(filename)}"`
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  console.log("Presigned GET URL:", url);
  return url;
};


export const gets3FileMetadata = async (key) => {
const command = new HeadObjectCommand({
    Bucket: "nodejs-notes-aws-s3-crud",
    Key: key, // ✅ MUST come from argument`
  });
  const response = await s3.send(command);
  return response;

}

export const Deletes3File = async (key) => {
  console.log("Deleting S3 file with key:", key);
  const command = new DeleteObjectCommand({
    Bucket: "nodejs-notes-aws-s3-crud",
    Key: key, // ✅ MUST come from argument`
  });
  const response = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });
  // console.log("Presigned DELETE URL:", response);
  return response;
}

export const DeletesFiles= async (keys) => {
  console.log("Deleting multiple S3 files with keys:", keys);

const command = new DeleteObjectsCommand({
  Bucket: "nodejs-notes-aws-s3-crud",
  Delete: {
    Objects: keys,
    Quiet: false, // set true to skip individual delete responses
  },
});

const response = await s3.send(command);
console.log("Deleted:", response.Deleted);
console.log("Errors:", response.Errors);

  }