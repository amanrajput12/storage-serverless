import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import { createGetSignedUrl, createuploadSignedUrl, Deletes3File, gets3FileMetadata } from "../config/s3.js";
import { createCloudfrontSignedUrl } from "../config/cloudfront.js";

export async function updateDirectoriesSize(parentId, deltaSize) {
  while (parentId) {
    const dir = await Directory.findById(parentId);
    dir.size += deltaSize;
    await dir.save();
    parentId = dir.parentDirId;
  }
}

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const filesize = req.headers.filesize;

    const user = await User.findById(req.user._id);
    const rootDir = await Directory.findById(req.user.rootDirId);

    const remainingSpace = user.maxStorageInBytes - rootDir.size;

    if (filesize > remainingSpace) {
      console.log("File too large");
      return res.destroy();
    }

    const extension = path.extname(filename);

    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });

    const fileId = insertedFile.id;

    const fullFileName = `${fileId}${extension}`;
    const filePath = `./storage/${fullFileName}`;

    const writeStream = createWriteStream(filePath);

    let totalFileSize = 0;
    let aborted = false;
    let fileUploadCompleted = false;

    req.on("data", async (chunk) => {
      if (aborted) return;
      totalFileSize += chunk.length;
      if (totalFileSize > filesize) {
        aborted = true;
        writeStream.close();
        await insertedFile.deleteOne();
        await rm(filePath);
        return req.destroy();
      }
      writeStream.write(chunk);
    });

    req.on("end", async () => {
      fileUploadCompleted = true;
      await updateDirectoriesSize(parentDirId, totalFileSize);
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("close", async () => {
      if (!fileUploadCompleted) {
        try {
          await insertedFile.deleteOne();
          await rm(filePath);
          console.log("file cleaned");
        } catch (err) {
          console.error("Error cleaning up aborted upload:", err);
        }
      }
    });
    
    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({ message: "Could not Upload File" });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// do change in this 
export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // If "download" is requested, set the appropriate headers
// const fileurl = await createGetSignedUrl({ key: `${id}${fileData.extension}`,filename:fileData.name });

const fileurl = await  createCloudfrontSignedUrl({
  key: `${id}${fileData.extension}`,
  filename:fileData.name
});
console.log("Cloudfront Signed URL controller:", fileurl);

   if(req.query.action =="download"){
    // const fileurl =await createGetSignedUrl({
    //   key: `${id}${fileData.extension}`,
    //   download:true,
    //   filename:fileData.name
    // });

  const fileurl =await createCloudfrontSignedUrl({
      key: `${id}${fileData.extension}`,
      download:true,
      filename:fileData.name
    });



   return res.redirect(fileurl);

   }


  return res.redirect(fileurl)
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
       const resp = await Deletes3File(`${id}${file.extension}`);
       console.log("s3 delete response",resp);
       const respdelete = await fetch(resp,{
        method:"DELETE",
       })
        console.log("s3 delete fetch response",respdelete);
        if(respdelete.status != 204){
          return res.status(500).json({ error: "Could not delete file from storage!" });
        }
       
    await file.deleteOne();
    await updateDirectoriesSize(file.parentDirId, -file.size);
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};


// create by me for s3 upload integration
export const uploadInitiate = async (req, res) => {
   const parentDirId = req.body.parentDirId || req.user.rootDirId;
 console.log("initiate upload called with parentDirId", req.body)

  try {
 console.log("try block")   


    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.body.name || "untitled";
    const filesize = req.body.size;

    const user = await User.findById(req.user._id);
    const rootDir = await Directory.findById(req.user.rootDirId);

    const remainingSpace = user.maxStorageInBytes - rootDir.size;

    if (filesize > remainingSpace) {
      console.log("File too large");
      return res.status(507).json({ error: "Not enough storage space!" });
    }

    const extension = path.extname(filename);

    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      isUploading: true,
    });

 const uploadUrl = await createuploadSignedUrl(
  `${insertedFile.id}${extension}`,
  req.body.contentType
);

    console.log("uploadurl",uploadUrl)
    return res.json({uploadUrl,fileId:insertedFile.id});



  } catch (error) {
    console.log("error in upload initiate",error)
     res.status(500).json({ error: "Failed to initiate upload" });
  }
}

// upload complete by me for s3 upload integration

export const uploadComplete = async (req, res,next) => {
      console.log("upload complete called with fileId", req.body.fileId)

      const file = await File.findById(req.body.fileId);

    if(!file){
      return res.status(404).json({ error: "File not found in our records!" });

    }
   const filedata = await   gets3FileMetadata(`${req.body.fileId}${file.extension}`);

  //  console.log("metadata from s3",filedata);

 try {

   if(filedata.ContentLength != file.size){
    await file.deleteOne();
    return res.status(400).json({ error: "Uploaded file size does not match expected size!" });
   }
  file.isUploading = false;
  await file.save();
   const respp = await  updateDirectoriesSize(file.parentDirId, file.size);
  res.json({message:"Upload marked as complete"})

 } catch (error) {
  console.log("Error in uploadComplete", error);
await file.deleteOne();
  return res.status(500).json({ error: "file could not be uploaded properly!" });
 }




    
}