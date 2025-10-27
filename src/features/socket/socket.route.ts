import { Router } from "express";
import { socketService } from "../../server";
import CustomResponse from "../../utils/helpers/response.util";

const socketRoute = Router();

socketRoute.get("/trigger", (req, res) => {
  if (socketService) {
    socketService.emitNewAlert(
      {
        alertId: "68f99c581314a473a5f7fcca",
        message: "Message alert",
      },
      "full"
    );
    new CustomResponse(201, res, "Triggered", {
      alertId: "68f99c581314a473a5f7fcca",
      message: "Message alert",
    });
    return;
  } else {
    res.status(500).send("Socket service not available");
  }
});

export default socketRoute;
