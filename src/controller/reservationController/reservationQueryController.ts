import { Request, Response } from "express";
import {
  queryReservations,
  getUserReservations,
  getOwnerReservations,
  getPropertyReservations,
  getReservationWithPayment,
} from "../../service/reservationService/reservationQueryService";

// Main query endpoint
export async function getReservations(req: Request, res: Response) {
  try {
    const {
      userId,
      propertyOwnerId,
      propertyId,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
    } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status as string;
    }
    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }
    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }
    if (search) {
      filters.search = search as string;
    }
    if (minAmount !== undefined) {
      filters.minAmount = Number(minAmount);
    }
    if (maxAmount !== undefined) {
      filters.maxAmount = Number(maxAmount);
    }

    const options = {
      userId: userId as string | undefined,
      propertyOwnerId: propertyOwnerId as string | undefined,
      propertyId: propertyId as string | undefined,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      filters,
    };

    const result = await queryReservations(options);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get reservations by user ID
export async function getUserReservationsHandler(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req.user?.userId as string);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
    } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status as string;
    }
    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }
    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }
    if (search) {
      filters.search = search as string;
    }
    if (minAmount !== undefined) {
      filters.minAmount = Number(minAmount);
    }
    if (maxAmount !== undefined) {
      filters.maxAmount = Number(maxAmount);
    }

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      filters,
    };

    const result = await getUserReservations(userId, options);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get reservations for a property owner (tenant)
export async function getOwnerReservationsHandler(req: Request, res: Response) {
  try {
    const propertyOwnerId =
      req.params.propertyOwnerId || (req.user?.userId as string);
    if (!propertyOwnerId) {
      return res.status(400).json({ message: "Property owner ID is required" });
    }

    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
    } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status as string;
    }
    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }
    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }
    if (search) {
      filters.search = search as string;
    }
    if (minAmount !== undefined) {
      filters.minAmount = Number(minAmount);
    }
    if (maxAmount !== undefined) {
      filters.maxAmount = Number(maxAmount);
    }

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      filters,
    };

    const result = await getOwnerReservations(propertyOwnerId, options);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching tenant reservations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get reservations for a specific property
export async function getPropertyReservationsHandler(
  req: Request,
  res: Response
) {
  try {
    const propertyId = req.params.propertyId;
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
    } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status as string;
    }
    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }
    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }
    if (search) {
      filters.search = search as string;
    }
    if (minAmount !== undefined) {
      filters.minAmount = Number(minAmount);
    }
    if (maxAmount !== undefined) {
      filters.maxAmount = Number(maxAmount);
    }

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      filters,
    };

    const result = await getPropertyReservations(propertyId, options);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching property reservations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getReservationWithPaymentHandler(
  req: Request,
  res: Response
) {
  try {
    const reservationId = req.params.id;

    if (!reservationId) {
      res.status(400).json({ message: "Reservation ID is required" });
      return;
    }

    const reservationWithPayment = await getReservationWithPayment(
      reservationId
    );

    if (!reservationWithPayment) {
      res.status(404).json({ message: "Reservation not found" });
      return;
    }

    res.json(reservationWithPayment);
    return;
  } catch (error) {
    console.error("Error fetching reservation with payment:", error);

    res.status(500).json({ message: "Internal server error" });
    return;
    // Atau jika ingin lebih spesifik (hati-hati dengan informasi sensitif):
    // return res.status(500).json({ message: 'Failed to fetch reservation details', error: error.message });
  }
}
