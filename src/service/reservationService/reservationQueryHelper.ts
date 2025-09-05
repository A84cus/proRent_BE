// services/reservationHelpers.ts
export function calculatePagination(
  page: number,
  limit: number,
  totalCount: number
) {
  return {
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasNext: page < Math.ceil(totalCount / limit),
    hasPrev: page > 1,
  };
}

export function addTotalAmounts(reservations: any[]) {
  return reservations.map((reservation) => {
    const paymentsArray = Array.isArray(reservation.payments)
      ? reservation.payments
      : [];

    return {
      ...reservation,
      totalAmount: paymentsArray.reduce((sum: number, payment: any) => {
        const amount = parseFloat(payment?.amount?.toString() || "0");
        return sum + amount;
      }, 0),
    };
  });
}

export function validateQueryOptions(options: any) {
  const { page = 1, limit = 10 } = options;

  if (page < 1) {
    throw new Error("Page must be >= 1");
  }
  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  return { page, limit };
}
