import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "../controllers/customerController";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

router.use(requireAuth);

// Customer routes
router.get("/", getCustomers); // GET /api/customers - Бүх харилцагчид
router.get("/:id", getCustomerById); // GET /api/customers/:id - Тодорхой харилцагч
router.get("/:id/stats", getCustomerStats); // GET /api/customers/:id/stats - Харилцагчийн статистик
router.post("/", createCustomer); // POST /api/customers - Харилцагч үүсгэх
router.put("/:id", updateCustomer); // PUT /api/customers/:id - Харилцагч засах
router.delete("/:id", deleteCustomer); // DELETE /api/customers/:id - Харилцагч устгах

export default router;
