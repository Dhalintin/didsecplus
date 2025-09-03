import { FilterDTO, Filters } from "../dtos/jobSeekerDto";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class SearchJobSeekerService {
  static async searchJobSeekers(filters: any) {
    const {
      role,
      skill,
      experienceLevel,
      workMode,
      jobType,
      industry,
      hasDisability,
    } = filters;

    return await prisma.jobSeeker.findMany({
      where: {
        ...(role && { interestedRoles: { has: role } }),
        ...(skill && { skills: { has: skill } }),
        ...(experienceLevel && { experienceLevel }),
        ...(workMode && { workMode }),
        ...(jobType && { jobType }),
        ...(industry && { industry }),
        ...(hasDisability !== undefined && {
          hasDisability: hasDisability === "true",
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            lastname: true,
            firstname: true,
            avatar: true,
          },
        },
      },
    });
  }

  static async searchTalent(
    filters: Filters = {
      page: 1,
      pageSize: 20,
    }
  ) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const normalize = (v: any) => {
      if (v === undefined || v === null) return null;
      if (Array.isArray(v))
        return v.filter((x) => x !== null && String(x).trim() !== "");
      if (typeof v === "string") {
        const t = v.trim();
        return t === "" ? null : [t];
      }
      return [v];
    };

    const roleArr = normalize(filters.role);
    const skillArr = normalize(filters.skill);
    const experienceLevel = filters.experienceLevel
      ? String(filters.experienceLevel).trim()
      : null;
    const workMode = filters.workMode ? String(filters.workMode).trim() : null;
    const jobType = filters.jobType ? String(filters.jobType).trim() : null;
    const industry = filters.industry ? String(filters.industry).trim() : null;
    const hasDisabilityRaw = filters.hasDisability;
    const hasDisability =
      hasDisabilityRaw === true || hasDisabilityRaw === "true"
        ? true
        : hasDisabilityRaw === false || hasDisabilityRaw === "false"
        ? false
        : null;

    const skip = Math.max(0, (Math.max(1, page) - 1) * pageSize);

    const pipeline: any[] = [];

    const matchOr: any[] = [];
    if (roleArr && roleArr.length)
      matchOr.push({ interestedRoles: { $in: roleArr } });
    if (skillArr && skillArr.length)
      matchOr.push({ skills: { $in: skillArr } });
    if (experienceLevel) matchOr.push({ experienceLevel });
    if (workMode) matchOr.push({ workMode });
    if (jobType) matchOr.push({ jobType });
    if (industry) matchOr.push({ industry });
    if (hasDisability !== null) matchOr.push({ hasDisability });

    let total = 0;
    let results: any[] = [];

    if (matchOr.length) {
      // Matching data pipeline
      const addFieldsStage: any = { $addFields: {} };

      addFieldsStage.$addFields.roleMatches =
        roleArr && roleArr.length
          ? {
              $size: {
                $ifNull: [
                  { $setIntersection: ["$interestedRoles", roleArr] },
                  [],
                ],
              },
            }
          : 0;

      addFieldsStage.$addFields.skillMatches =
        skillArr && skillArr.length
          ? {
              $size: {
                $ifNull: [{ $setIntersection: ["$skills", skillArr] }, []],
              },
            }
          : 0;

      addFieldsStage.$addFields.experienceLevelMatch = experienceLevel
        ? {
            $cond: [
              {
                $eq: [{ $ifNull: ["$experienceLevel", null] }, experienceLevel],
              },
              1,
              0,
            ],
          }
        : 0;

      addFieldsStage.$addFields.workModeMatch = workMode
        ? {
            $cond: [
              { $eq: [{ $ifNull: ["$workMode", null] }, workMode] },
              1,
              0,
            ],
          }
        : 0;

      addFieldsStage.$addFields.jobTypeMatch = jobType
        ? { $cond: [{ $eq: [{ $ifNull: ["$jobType", null] }, jobType] }, 1, 0] }
        : 0;

      addFieldsStage.$addFields.industryMatch = industry
        ? {
            $cond: [
              { $eq: [{ $ifNull: ["$industry", null] }, industry] },
              1,
              0,
            ],
          }
        : 0;

      addFieldsStage.$addFields.hasDisabilityMatch =
        hasDisability !== null
          ? {
              $cond: [
                { $eq: [{ $ifNull: ["$hasDisability", null] }, hasDisability] },
                1,
                0,
              ],
            }
          : 0;

      pipeline.push({ $match: { $or: matchOr } });
      pipeline.push(addFieldsStage);

      pipeline.push({
        $addFields: {
          matchScore: {
            $add: [
              "$roleMatches",
              "$skillMatches",
              "$experienceLevelMatch",
              "$workModeMatch",
              "$jobTypeMatch",
              "$industryMatch",
              "$hasDisabilityMatch",
            ],
          },
        },
      });

      pipeline.push({ $match: { $expr: { $gt: ["$matchScore", 0] } } });

      pipeline.push({
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc",
        },
      });
      pipeline.push({
        $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true },
      });

      pipeline.push({
        $project: {
          _id: 1,
          userId: 1,
          "user.id": "$userDoc._id",
          "user.firstname": "$userDoc.firstname",
          "user.lastname": "$userDoc.lastname",
          "user.email": "$userDoc.email",
          "user.avatar": "$userDoc.avatar",
          "user.othername": "$userDoc.othername",
          "user.pronoun": "$userDoc.pronoun",
          "user.phone_number": "$userDoc.phone_number",
          interestedRoles: 1,
          skills: 1,
          experienceLevel: 1,
          workMode: 1,
          jobType: 1,
          industry: 1,
          hasDisability: 1,
          profileCompletion: 1,
          matchScore: 1,
        },
      });

      pipeline.push({
        $sort: { matchScore: -1, profileCompletion: -1, _id: 1 },
      });
      pipeline.push({
        $facet: {
          metadata: [{ $count: "total" }],
          results: [{ $skip: skip }, { $limit: pageSize }],
        },
      });
      pipeline.push({
        $unwind: { path: "$metadata", preserveNullAndEmptyArrays: true },
      });
      pipeline.push({
        $project: {
          total: "$metadata.total",
          results: 1,
        },
      });

      const dbResult = await prisma.$runCommandRaw({
        aggregate: "JobSeeker",
        pipeline,
        cursor: {},
      });

      if (dbResult?.cursor?.firstBatch && dbResult.cursor.firstBatch.length) {
        const first = dbResult.cursor.firstBatch[0];
        total = first?.total || 0;
        results = first?.results || [];
      } else if (Array.isArray(dbResult) && dbResult.length) {
        total = dbResult[0]?.total || 0;
        results = dbResult[0]?.results || [];
      }
    }

    // If no matches or no filters, fetch random data for 'other'
    if (!matchOr.length || results.length === 0) {
      const randomPipeline = [
        { $match: {} },
        { $sample: { size: pageSize } },
        {
          $lookup: {
            from: "User",
            localField: "userId",
            foreignField: "_id",
            as: "userDoc",
          },
        },
        {
          $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            "user.id": "$userDoc._id",
            "user.firstname": "$userDoc.firstname",
            "user.lastname": "$userDoc.lastname",
            "user.email": "$userDoc.email",
            "user.avatar": "$userDoc.avatar",
            interestedRoles: 1,
            skills: 1,
            experienceLevel: 1,
            workMode: 1,
            jobType: 1,
            industry: 1,
            hasDisability: 1,
            profileCompletion: 1,
          },
        },
      ];

      const randomResult = await prisma.$runCommandRaw({
        aggregate: "JobSeeker",
        pipeline: randomPipeline,
        cursor: {},
      });

      let randomResults: any[] = [];
      if (
        randomResult?.cursor?.firstBatch &&
        randomResult.cursor.firstBatch.length
      ) {
        randomResults = randomResult.cursor.firstBatch;
      } else if (Array.isArray(randomResult) && randomResult.length) {
        randomResults = randomResult;
      }

      // Transform random results to desired format without defaults
      const transformedOther = randomResults.map((item) => ({
        location: item.location || { city: null, country: null }, // Use existing data or null
        experience: item.experience || [], // Use existing data or empty array
        education: item.education || [], // Use existing data or empty array
        certifications: item.certifications || [], // Use existing data or empty array
        portfolio: item.portfolio || [], // Use existing data or empty array
        id: item._id?.$oid || null, // Convert to string ID or null
        userId: item.userId?.$oid || null, // Convert to string ID or null
        bio: item.bio || null, // Use existing data or null
        hasDisability: item.hasDisability || null,
        interestedRoles: item.interestedRoles || [],
        experienceLevel: item.experienceLevel || null,
        workMode: item.workMode || null,
        jobType: item.jobType || null,
        skills: item.skills || [],
        industry: item.industry || null,
        resume: item.resume || null,
        interests: item.interests || [],
        profileCompletion: item.profileCompletion || null,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
        user: {
          id: item.user?.id?.$oid || item.userId?.$oid || null,
          email: item.user?.email || null,
          lastname: item.user?.lastname || null,
          firstname: item.user?.firstname || null,
          avatar: item.user?.avatar || null,
        },
      }));

      return {
        page: Math.max(1, page),
        limit: pageSize,
        total: transformedOther.length,
        other: transformedOther,
      };
    }

    // Transform matching results to desired format without defaults
    const transformedData = results.map((item) => ({
      location: item.location || { city: null, country: null }, // Use existing data or null
      experience: item.experience || [], // Use existing data or empty array
      education: item.education || [], // Use existing data or empty array
      certifications: item.certifications || [], // Use existing data or empty array
      portfolio: item.portfolio || [], // Use existing data or empty array
      id: item._id?.$oid || null, // Convert to string ID or null
      userId: item.userId?.$oid || null, // Convert to string ID or null
      bio: item.bio || null, // Use existing data or null
      hasDisability: item.hasDisability || null,
      interestedRoles: item.interestedRoles || [],
      experienceLevel: item.experienceLevel || null,
      workMode: item.workMode || null,
      jobType: item.jobType || null,
      skills: item.skills || [],
      industry: item.industry || null,
      resume: item.resume || null,
      interests: item.interests || [],
      profileCompletion: item.profileCompletion || null,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
      user: {
        id: item.user?.id?.$oid || item.userId?.$oid || null,
        email: item.user?.email || null,
        lastname: item.user?.lastname || null,
        firstname: item.user?.firstname || null,
        avatar: item.user?.avatar || null,
      },
    }));

    return {
      page: Math.max(1, page),
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data: transformedData,
    };
  }

  static async getFilter(id: string) {
    return await prisma.filter.findUnique({
      where: { id },
    });
  }

  static async saveFilter(filter: FilterDTO, userId: string) {
    let companyProfileId = filter.companyProfileId;

    if (!userId && !companyProfileId) {
      throw new Error("userId is required");
    }

    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });

    if (companyProfile) {
      companyProfileId = companyProfile.id;
    }

    return await prisma.filter.create({
      data: {
        ...filter,
        userId,
        companyProfileId: companyProfileId || undefined,
      },
    });
  }

  static async updateFilter(id: string, filter: Filters) {
    return await prisma.filter.update({
      where: { id },
      data: filter,
    });
  }
}
