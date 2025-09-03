import express from "express";
const appRouter = express.Router();

import authRoutes from "./authentication/routes/auth.route";
import CompanyRoutes from "./Recruiter/companyProfile/routes/company";
import jobsRoutes from "./Recruiter/jobs/routes/job.route";
import jobSeekerRoute from "./jobSeeker/jobSeekerProfile/routes/jobSeeker.route";
import applicationRoutes from "./jobSeeker/application/routes/jobApplication.route";
import twofaRoutes from "./authentication/routes/twoFactorAuth.route";
import userRoutes from "./users/routes";
import interviewRoutes from "./Recruiter/interview/routes/interview.route";
import countryRoutes from "./country/routes/country.route";

appRouter.use("/auth", authRoutes);
appRouter.use("/2FaAuth", twofaRoutes);
appRouter.use("/job-seeker", jobSeekerRoute);
appRouter.use("/company-profile", CompanyRoutes);
appRouter.use("/jobs", jobsRoutes);
appRouter.use("/application", applicationRoutes);
appRouter.use("/settings", applicationRoutes);
appRouter.use("/users", userRoutes);
appRouter.use("/interview", interviewRoutes);
appRouter.use("/country", countryRoutes);

export default appRouter;
