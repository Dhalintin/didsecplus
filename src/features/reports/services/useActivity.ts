import { PrismaClient } from "@prisma/client";
import { AlertDTO, GetAlertDTO, UpdateAlertDTO } from "../dtos/alert.dto";

const prisma = new PrismaClient();

interface Alert {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  source: string;
  latitude: number;
  longitude: number;
  state?: string | null;
  lga?: string | null;
  created_at: string;
  updated_at: string;
}

interface AlertResponse {
  data: Alert[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}

// Raw MongoDB result interfaces
interface RawAlert {
  _id: { $oid: string };
  userId: { $oid: string };
  title: string;
  description: string;
  status: string;
  source: string;
  latitude: number;
  longitude: number;
  state?: string | null;
  lga?: string | null;
  created_at: { $date: string };
  updated_at: { $date: string };
}

export class IncidentService {
  async getIncidents(userId: string, data: AlertDTO) {
    const alert = await prisma.alert.create({
      data: {
        userId,
        ...data,
      },
    });
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return alert;
    }
    await prisma.ticket.create({
      data: {
        alert_Id: alert.id,
        title: `Follow up: ${data.title}`,
        created_by: userId,
      },
    });
    return alert;
  }
}
