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

export class AlertService {
  async createAlert(userId: string, data: AlertDTO) {
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

  async getAlerts(data: GetAlertDTO) {
    const { page, page_size, status, state, lga, from, to } = data;

    // Ensure page and page_size are numbers
    const limit = Number(page_size) || 20;
    const skip = Number(page - 1) * limit || 0;

    // Build match stage
    const matchStage: any = {};
    if (status) matchStage.status = status;
    if (state) matchStage.state = state;
    if (lga) matchStage.lga = lga;
    if (from || to) {
      matchStage.created_at = {};
      if (from) matchStage.created_at.$gte = new Date(from);
      if (to) matchStage.created_at.$lte = new Date(to);
    }

    // Aggregation pipelines
    const pipeline = [
      { $match: matchStage },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const countPipeline = [{ $match: matchStage }, { $count: "total" }];

    // Execute queries
    const alertsResult = (await prisma.alert.aggregateRaw({ pipeline })) as any;
    const countResult = (await prisma.alert.aggregateRaw({
      pipeline: countPipeline,
    })) as any;

    // Transform data
    const transformedData: Alert[] = (alertsResult || []).map((alert: any) => ({
      id: alert._id?.$oid || alert._id,
      userId: alert.userId?.$oid || alert.userId || null,
      title: alert.title,
      description: alert.description || null,
      status: alert.status,
      source: alert.source,
      latitude: alert.latitude,
      longitude: alert.longitude,
      state: alert.state,
      lga: alert.lga,
      assigned_unit: alert.assigned_unit || null,
      created_at: alert.created_at?.$date || alert.created_at,
      updated_at: alert.updated_at?.$date || alert.updated_at,
    }));

    const total = countResult[0]?.total || 0;

    return {
      data: transformedData,
      meta: {
        total,
        page: Number(page) || 1,
        page_size: transformedData.length,
        limit,
      },
    };
    // const { page, page_size, status, state, lga, from, to } = data;

    // // Ensure page and page_size are numbers
    // const limit = Number(page_size) || 20;
    // const skip = Number(page - 1) * limit || 0;

    // // Build match stage
    // const matchStage: any = {};
    // if (status) matchStage.status = status;
    // if (state) matchStage.state = state;
    // if (lga) matchStage.lga = lga;
    // if (from || to) {
    //   matchStage.created_at = {};
    //   if (from) matchStage.created_at.$gte = new Date(from);
    //   if (to) matchStage.created_at.$lte = new Date(to);
    // }

    // // Aggregation pipelines
    // const pipeline = [
    //   { $match: matchStage },
    //   { $sort: { created_at: -1 } },
    //   { $skip: skip },
    //   { $limit: limit },
    // ];
    // const countPipeline = [{ $match: matchStage }, { $count: "total" }];

    // // Execute queries
    // const alertsResult = (await prisma.alert.aggregateRaw({ pipeline })) as any;
    // const countResult = (await prisma.alert.aggregateRaw({
    //   pipeline: countPipeline,
    // })) as any;

    // // Transform data
    // const transformedData: Alert[] = (alertsResult || []).map((alert: any) => ({
    //   id: alert._id?.$oid || alert._id,
    //   userId: alert.userId?.$oid || alert.userId || null,
    //   title: alert.title,
    //   description: alert.description || null,
    //   status: alert.status,
    //   source: alert.source,
    //   latitude: alert.latitude,
    //   longitude: alert.longitude,
    //   state: alert.state,
    //   lga: alert.lga,
    //   assigned_unit: alert.assigned_unit || null,
    //   created_at: alert.created_at?.$date || alert.created_at,
    //   updated_at: alert.updated_at?.$date || alert.updated_at,
    // }));

    // const total = countResult[0]?.total || 0;

    // return {
    //   data: transformedData,
    //   meta: { total, page, page_size: limit },
    // };
  }

  async getAlertById(id: string) {
    return await prisma.alert.findUnique({
      where: { id },
    });
  }

  async updateAlert(updatData: UpdateAlertDTO) {
    const { id, data } = updatData;
    return await prisma.alert.update({
      where: { id },
      data,
    });
  }

  async deleteAlert(id: string) {
    return await prisma.alert.delete({
      where: { id },
    });
  }
}
