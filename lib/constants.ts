export const Role = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  DELIVERY_PARTNER: "delivery_partner",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ApprovalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
} as const;
export type ApprovalStatus =
  (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const MealType = {
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
} as const;
export type MealType = (typeof MealType)[keyof typeof MealType];

export const DeliveryOrderStatus = {
  ASSIGNED: "assigned",
  DELIVERED: "delivered",
} as const;
export type DeliveryOrderStatus =
  (typeof DeliveryOrderStatus)[keyof typeof DeliveryOrderStatus];
