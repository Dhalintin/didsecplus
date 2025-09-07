import express from "express";
const appRouter = express.Router();

import authRoutes from "./authentication/routes/auth.route";
import alertRoutes from "./alerts/routes/alert.route";
import ticketRoutes from "./tickets/routes/ticket.route";
// import locationRoutes from "./locations/routes/location.route";
// import analyticsRoute from "./analytics/routes";
// import userRoute from "./users/routes/user.route";

appRouter.use("/auth", authRoutes);
appRouter.use("/alerts", alertRoutes);
appRouter.use("/tickets", ticketRoutes);
// appRouter.use("/locations", locationRoutes);
// appRouter.use("/analytics", analyticsRoute);
// appRouter.use("/users", userRoute);

export default appRouter;
