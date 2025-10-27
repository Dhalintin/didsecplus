import { Router } from "express";
import { socketService } from "../../server";
import CustomResponse from "../../utils/helpers/response.util";

const socketRoute = Router();

socketRoute.get("/trigger", (req, res) => {
  if (socketService) {
    socketService.emitNewAlert(
      {
        alertId: "alert-id-123",
        message: "Message alert",
      },
      "full"
    );
    new CustomResponse(201, res, "Triggered", {
      alertId: "alert-id-123",
      message: "Message alert",
    });
    return;
  } else {
    res.status(500).send("Socket service not available");
  }
});

export default socketRoute;
