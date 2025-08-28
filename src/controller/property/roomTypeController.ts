import { Request, Response } from "express";
import roomTypeService from "../../service/property/roomTypeService";

export const createRoomType = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId || req.body.ownerId; // gunakan userId dari middleware
    const data = req.body;
    const roomType = await roomTypeService.createRoomType(data, ownerId);
    return res.status(201).json({ success: true, data: roomType });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getRoomTypesByProperty = async (req: Request, res: Response) => {
  try {
    const ownerId = String(req.user?.userId || "");
    const propertyId = String(req.query.propertyId || "");
    if (!propertyId) {
      return res
        .status(400)
        .json({ success: false, message: "propertyId is required" });
    }
    const roomTypes = await roomTypeService.getRoomTypesByProperty(
      propertyId,
      ownerId
    );
    return res.status(200).json({ success: true, data: roomTypes });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
  }
};

export const updateRoomType = async (req: Request, res: Response) => {
  try {
    const ownerId = String(req.user?.userId || "");
    const id = String(req.params.id || "");
    const data = req.body;
    const updated = await roomTypeService.updateRoomType(id, data, ownerId);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
  }
};

export const deleteRoomType = async (req: Request, res: Response) => {
  try {
    const ownerId = String(req.user?.userId || "");
    const id = String(req.params.id || "");
    await roomTypeService.deleteRoomType(id, ownerId);
    return res
      .status(200)
      .json({ success: true, message: "Room type deleted" });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
  }
};
