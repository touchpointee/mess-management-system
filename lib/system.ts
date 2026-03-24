import { prisma } from "@/lib/prisma";

export type SystemSettingsData = {
  businessName: string;
  shortName: string;
  phone: string;
  supportEmail: string | null;
  address: string;
  city: string;
  lat: number;
  lng: number;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  heroImageUrl: string | null;
};

const DEFAULT_SETTINGS: SystemSettingsData = {
  businessName: process.env.MESS_BUSINESS_NAME || "Mess Management System",
  shortName: process.env.MESS_SHORT_NAME || "MESS",
  phone: process.env.MESS_PHONE || "",
  supportEmail: process.env.MESS_SUPPORT_EMAIL || null,
  address: process.env.MESS_ADDRESS || "",
  city: process.env.MESS_CITY || "",
  lat: Number(process.env.MESS_LAT || 0),
  lng: Number(process.env.MESS_LNG || 0),
  breakfastPrice: Number(process.env.MESS_BREAKFAST_PRICE || 0),
  lunchPrice: Number(process.env.MESS_LUNCH_PRICE || 0),
  dinnerPrice: Number(process.env.MESS_DINNER_PRICE || 0),
  heroImageUrl: process.env.MESS_HERO_IMAGE_URL || null,
};

export async function getSystemSettings(): Promise<SystemSettingsData> {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      return DEFAULT_SETTINGS;
    }
    return {
      businessName: settings.businessName,
      shortName: settings.shortName,
      phone: settings.phone,
      supportEmail: settings.supportEmail,
      address: settings.address,
      city: settings.city,
      lat: settings.lat,
      lng: settings.lng,
      breakfastPrice: settings.breakfastPrice,
      lunchPrice: settings.lunchPrice,
      dinnerPrice: settings.dinnerPrice,
      heroImageUrl: settings.heroImageUrl,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
