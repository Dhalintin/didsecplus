"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
class SecurityController {
    // Create Alert
    getSecurity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // try {
            //   let state = req.body.state;
            //   let lga = req.body.lga;
            //   const { error } = alertSchema.validate(req.body);
            //   if (error) {
            //     new CustomResponse(400, res, error.details[0].message);
            //     return;
            //   }
            //   const responseData: AlertDTO = req.body;
            //   const coord: LocationInput = {
            //     latitude: Number(responseData.latitude),
            //     longitude: Number(responseData.longitude),
            //   };
            //   if (!state || !lga) {
            //     const locationData = await getLocationDetails(coord);
            //     if (locationData) {
            //       const { stateName, lgaName } = locationData;
            //       state = stateName;
            //       lga = lgaName;
            //     }
            //   }
            //   const data: AlertDTO = {
            //     ...responseData,
            //     latitude: Number(responseData.latitude),
            //     longitude: Number(responseData.longitude),
            //     state,
            //     lga,
            //   };
            //   const alert = await alertService.createAlert(req.user.userId, data);
            //   new CustomResponse(201, res, "Alert created successfully", alert);
            //   return;
            // } catch (err: any) {
            //   const status = err.statusCode || 500;
            //   new CustomResponse(status, res, err.message);
            // }
        });
    }
}
exports.SecurityController = SecurityController;
