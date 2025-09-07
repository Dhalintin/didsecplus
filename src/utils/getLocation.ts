import axios from "axios";
import dotenv from "dotenv";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

interface LocationInput {
  latitude: number;
  longitude: number;
}

interface LocationResponse {
  state: string | null;
  lga: string | null;
  formattedAddress?: string | null;
}

export const getLocationDetails = async (input: LocationInput) => {
  try {
    const { latitude, longitude } = input;

    const email = process.env.NOMINATIM_EMAIL;
    if (!email) {
      throw new Error("Nominatim email is missing in environment variables");
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&email=${encodeURIComponent(
      email
    )}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "didsecplus/1.0 (your.email@example.com)",
      },
    });

    if (response.data.error) {
      throw new Error(`Nominatim API error: ${response.data.error}`);
    }

    const address = response.data.address;
    const state = address.state || address.region || null;
    const lga =
      address.county ||
      address.district ||
      address.city ||
      address.municipality ||
      null; // e.g., "Ikeja"

    return {
      state,
      lga,
      formattedAddress: response.data.display_name || null,
    };
  } catch (error: any) {
    console.error("Error in getLocationDetails:", error);
    throw new Error(`Failed to fetch location details: ${error.message}`);
  }
};
