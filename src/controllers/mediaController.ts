import dotenv from "dotenv";
import { Request, Response } from "express";
import * as fs from "fs";
import path from "path";
import sharp from "sharp";
import { promisify } from "util";
import { mediaHelper, resHelper } from "../utils";

dotenv.config();

const getMedia =
  (type: "images" | "videos") =>
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { url } = req.params;
      const folderPath = path.join(__dirname, `../../uploads/${type}`);
      const filePath = path.join(folderPath, url);

      await fs.promises.access(filePath, fs.constants.F_OK).catch(() => {
        throw { status: 404, message: `${type.slice(0, -1)} not found` };
      });
      await mediaHelper.sendMedia(res, filePath);
      return res;
    } catch (error: any) {
      const status = error.status || 500;
      const message = error.message || "Internal Server Error";
      return res.status(status).send(resHelper.error(status, message, error instanceof Error ? error.message : ""));
    }
  };

const getImage = getMedia("images");
const getVideo = getMedia("videos");

// const getAvatar = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { avatarUrl } = req.params;
//     const imagePath = path.join(__dirname, "../../uploads/avatar");
//     const filePath = path.join(imagePath, avatarUrl);
//     if (!(await promisify(fs.exists)(filePath))) {
//       const filePath = path.join(imagePath, "avatar-default.png");
//       await mediaHelper.sendImg(res, filePath);
//       return res;
//     }
//     await mediaHelper.sendImg(res, filePath);
//     return res;
//   } catch (error) {
//     return res
//       .status(500)
//       .send(resHelper.error(500, "Internal Server Error", error instanceof Error ? error.message : ""));
//   }
// };

// const uploadImage = (req: any, res: any) => {
//   const data = res.locals.payload || null;
//   const action = res.locals.action || "unknown";
//   const fieldName = action.includes("category")
//     ? "category"
//     : action.includes("menu")
//     ? "menu"
//     : "data";

//   const inputFile = req.file.buffer;
//   const outputFile = "uploads/images/" + data.imgUrl;
//   sharp(inputFile)
//     .resize(800, 600)
//     .webp()
//     .toFile(outputFile, (err, info) => {
//       if (err)
//         return res
//           .status(200)
//           .send(
//             resHelper(              200,              true,              `${action} successfully but image processing error`,              err,
//               { [fieldName]: data, imgPath: mediaHelper.generateImgPath(req) }
//             )
//           );
//       return res
//         .status(200)
//         .send(
//           resHelper(
//             200,
//             true,
//             `${action} & uploaded imaged successfully`,
//             null,
//             { [fieldName]: data, imgPath: mediaHelper.generateImgPath(req) }
//           )
//         );
//     });
// };

// const renameImg = async (oldName: string, newName: string) => {
//   const oldPath = path.join(__dirname, "../../uploads/images", oldName);
//   const newPath = path.join(__dirname, "../../uploads/images", newName);
//   return new Promise((resolve, reject) => {
//     fs.rename(oldPath, newPath, (err) => {
//       if (err) reject(false);
//       else resolve(true);
//     });
//   });
// };

// const deleteImg = async (imgUrl: string) => {
//   const imgPath = path.join(__dirname, "../../uploads/images", imgUrl);
//   return new Promise((resolve, reject) => {
//     fs.unlink(imgPath, (err) => {
//       if (err) reject(false);
//       else resolve(true);
//     });
//   });
// };

export default {
  getImage,
  getVideo,
  //   getAvatar,
  //   uploadImage,
  //   renameImg,
  //   deleteImg,
};
