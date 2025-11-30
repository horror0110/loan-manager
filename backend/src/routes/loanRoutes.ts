import express from "express";
import {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  markLoanAsPaid,
  getLoanStats,
  addPayment,
  getPaymentHistory,
  deletePayment,
} from "../controllers/loanController";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

router.use(requireAuth);

// Loan routes
router.get("/", getLoans);
router.get("/stats", getLoanStats);
router.get("/:id", getLoanById);
router.post("/", createLoan);
router.put("/:id", updateLoan);
router.delete("/:id", deleteLoan);
router.patch("/:id/paid", markLoanAsPaid);

// Payment routes
router.post("/:id/payments", addPayment); // POST /api/loans/:id/payments - Төлөлт нэмэх
router.get("/:id/payments", getPaymentHistory); // GET /api/loans/:id/payments - Төлөлтийн түүх
router.delete("/:id/payments/:paymentId", deletePayment); // DELETE /api/loans/:id/payments/:paymentId - Төлөлт устгах

export default router;
