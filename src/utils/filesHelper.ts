import { Request, Response } from "express";
import * as fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import sharp from "sharp";
import { pipeline } from "stream/promises";
const sendMedia = (res: Response, filePath: string) =>
  new Promise<void>((resolve, reject) => {
    res.sendFile(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const processFiles = async (files: Express.Multer.File[], userId: number) => {
  const results: any[] = [];
  for (const file of files) {
    const ext = path.extname(file.originalname) || "";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const dir = path.dirname(file.path);
    if (file.mimetype.startsWith("image/")) {
      const newFilename = `${uniqueSuffix}-${userId}.webp`;
      const outputPath = path.join(dir, newFilename);
      await pipeline(
        fs.createReadStream(file.path),
        sharp()
          // .resize({ width: 1280, height: 1280, fit: "inside" })
          .webp({ quality: 80 }),
        fs.createWriteStream(outputPath)
      );
      await fsPromises.unlink(file.path);
      file.filename = newFilename;
      file.path = outputPath;
      results.push(file);
    } else if (file.mimetype.startsWith("video/")) {
      const newFilename = `${uniqueSuffix}-${userId}${ext}`;
      const outputPath = path.join(dir, newFilename);
      await fsPromises.rename(file.path, outputPath);
      file.filename = newFilename;
      file.path = outputPath;
      results.push(file);
    } else if (file.mimetype.startsWith("application/")) {
      const newFilename = `${uniqueSuffix}-${userId}${ext}`;
      const outputPath = path.join(dir, newFilename);
      await fsPromises.rename(file.path, outputPath);
      file.filename = newFilename;
      file.path = outputPath;
      results.push(file);
    }
  }
  return results;
};

const buildMediaUrl = (filePath: string, fileType: string): string => {
  const filename = path.basename(filePath);
  const folder = fileType.startsWith("video") ? "videos" : fileType.startsWith("image") ? "images" : "documents";
  return `uploads/${folder}/${encodeURIComponent(filename)}`;
};

const generateImgPath = (req: Request) => {
  return req.protocol + "://" + req.get("host") + "/api/image/";
};

const generateAvatar = (req: Request, userId: number) => {
  return req.protocol + "://" + req.get("host") + "/api/avatar/" + userId;
};

export default { sendMedia, generateImgPath, generateAvatar, buildMediaUrl, processFiles };
