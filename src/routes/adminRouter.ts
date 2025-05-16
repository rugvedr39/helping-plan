import express from "express";
import { AdminController } from "../controllers/AdminController";

const router = express.Router();
const adminController = new AdminController();
router.get("/users", adminController.listUsers);
router.get("/usersCount", adminController.UsersCount);
router.put("/users/:id", adminController.updateUserDetails);
router.get("/getpassword", adminController.getadminpassWord);
router.post("/updatePassword", adminController.updatePassword);
router.get("/getAdminDetails", adminController.getAdminDetails);
router.post("/save-meeting-details", adminController.updateZoomDetails);

export default router;
