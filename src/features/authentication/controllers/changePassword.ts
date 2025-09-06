// import { Request, Response } from "express";
// // import { AuthService } from "../services/authService";

// import { comparePassword } from "../../../utils/hash";
// import { ChangePasswordService } from "../services/changePassword";
// import CustomResponse from "../../../utils/helpers/response.util";

// export class ChangePasswordController {
//   static async changePassword(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = req.user.id;
//       const { currentPassword, newPassword } = req.body;

//       const user = await ChangePasswordService.getUserById(userId);
//       if (!user) {
//         new CustomResponse(404, res, "User not found");
//         return;
//       }

//       const isMatch = await comparePassword(currentPassword, user.password);
//       if (!isMatch) {
//         new CustomResponse(400, res, "Incorrect password!");
//         return;
//       }

//       const updated = await ChangePasswordService.updatePassword(
//         userId,
//         newPassword
//       );
//       new CustomResponse(201, res, "Password changed successfully", updated);
//       return;
//     } catch (error: any) {
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//       return;
//     }
//   }
// }
