import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";

const idDefault = () => randomUUID();

const UserSchema = new Schema(
  {
    _id: { type: String, default: idDefault },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: null, sparse: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "CUSTOMER" },
    address: { type: String, default: null },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    offerBreakfastPrice: { type: Number, default: null },
    offerLunchPrice: { type: Number, default: null },
    offerDinnerPrice: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const SystemSettingsSchema = new Schema(
  {
    _id: { type: String, default: "default" },
    businessName: { type: String, required: true },
    shortName: { type: String, required: true },
    phone: { type: String, required: true },
    supportEmail: { type: String, default: null },
    address: { type: String, required: true },
    city: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    breakfastPrice: { type: Number, default: 0 },
    lunchPrice: { type: Number, default: 0 },
    dinnerPrice: { type: Number, default: 0 },
    heroImageUrl: { type: String, default: null },
  },
  { versionKey: false }
);

const PaymentSchema = new Schema(
  {
    _id: { type: String, default: idDefault },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const DeliveryLocationSchema = new Schema(
  {
    _id: { type: String, default: idDefault },
    userId: { type: String, required: true, index: true },
    label: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    mealType: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const LeaveSchema = new Schema(
  {
    _id: { type: String, default: idDefault },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    mealType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
LeaveSchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

const DayBookingSchema = new Schema(
  {
    _id: { type: String, default: idDefault },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    mealType: { type: String, required: true },
    deliveryLocationId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
DayBookingSchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

const MessHolidaySchema = new Schema(
  {
    _id: { type: String, default: idDefault },
    date: { type: Date, required: true },
    mealType: { type: String, required: true }, // "ALL", "BREAKFAST", "LUNCH", "DINNER"
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
MessHolidaySchema.index({ date: 1, mealType: 1 }, { unique: true });

export const User =
  mongoose.models.User ?? mongoose.model("User", UserSchema);
export const SystemSettings =
  mongoose.models.SystemSettings ??
  mongoose.model("SystemSettings", SystemSettingsSchema);
export const Payment =
  mongoose.models.Payment ?? mongoose.model("Payment", PaymentSchema);
export const DeliveryLocation =
  mongoose.models.DeliveryLocation ??
  mongoose.model("DeliveryLocation", DeliveryLocationSchema);
export const Leave =
  mongoose.models.Leave ?? mongoose.model("Leave", LeaveSchema);
export const DayBooking =
  mongoose.models.DayBooking ?? mongoose.model("DayBooking", DayBookingSchema);
export const MessHoliday =
  mongoose.models.MessHoliday ?? mongoose.model("MessHoliday", MessHolidaySchema);
