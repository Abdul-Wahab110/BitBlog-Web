import { Response, NextFunction } from 'express';
import { MediaModel } from '../models/mediaModel';
import { ResponseUtil } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class MediaController {
  public static async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        ResponseUtil.error(res, 'No image file uploaded or file format invalid', 400);
        return;
      }

      const userId = req.user?.userId || 1;
      const file = req.file;
      const publicUrl = `/uploads/${file.filename}`;

      const mediaRecord = await MediaModel.createMedia({
        uploadedBy: userId,
        fileName: file.filename || file.originalname,
        filePath: publicUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        altText: (req.body.altText || file.originalname).trim(),
      });

      ResponseUtil.success(res, { ...mediaRecord, url: publicUrl }, 'Image file uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      let uploadedByFilter: number | undefined = undefined;

      // Authors and normal Users can ONLY view their own uploaded assets
      if (userRole !== 'Admin' && userRole !== 'Editor') {
        uploadedByFilter = userId;
      } else if (req.query.scope === 'mine') {
        uploadedByFilter = userId;
      } else if (req.query.uploaded_by) {
        uploadedByFilter = parseInt(req.query.uploaded_by as string, 10);
      }

      const mediaList = await MediaModel.findAll(search, uploadedByFilter);
      ResponseUtil.success(res, mediaList, 'Media library assets retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async updateAltText(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { altText } = req.body;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const mediaRecord = await MediaModel.findById(id);
      if (!mediaRecord) {
        ResponseUtil.error(res, `Media asset #${id} not found`, 404);
        return;
      }

      if (userRole !== 'Admin' && userRole !== 'Editor' && mediaRecord.uploaded_by !== userId) {
        ResponseUtil.error(res, 'You are only authorized to modify your own uploaded media assets.', 403);
        return;
      }

      const updated = await MediaModel.updateAltText(id, altText);
      ResponseUtil.success(res, updated, 'Media alt text updated');
    } catch (error) {
      next(error);
    }
  }

  public static async deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const mediaRecord = await MediaModel.findById(id);
      if (!mediaRecord) {
        ResponseUtil.error(res, `Media asset #${id} not found`, 404);
        return;
      }

      // Authors and standard users can only delete assets they uploaded
      if (userRole !== 'Admin' && userRole !== 'Editor' && mediaRecord.uploaded_by !== userId) {
        ResponseUtil.error(res, 'You are only authorized to delete your own uploaded media assets.', 403);
        return;
      }

      const result = await MediaModel.deleteMedia(id);
      if (!result.success) {
        ResponseUtil.error(res, `Media asset #${id} not found`, 404);
        return;
      }

      ResponseUtil.success(
        res,
        result.affected,
        `Media asset deleted from disk and cleaned up across all articles, profiles, categories, and settings.`
      );
    } catch (error) {
      next(error);
    }
  }
}
