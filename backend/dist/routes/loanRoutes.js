"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loanController_1 = require("../controllers/loanController");
const requireAuth_1 = require("../middleware/requireAuth");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
// Loan routes
router.get("/", loanController_1.getLoans);
router.get("/stats", loanController_1.getLoanStats);
router.get("/:id", loanController_1.getLoanById);
router.post("/", loanController_1.createLoan);
router.put("/:id", loanController_1.updateLoan);
router.delete("/:id", loanController_1.deleteLoan);
router.patch("/:id/paid", loanController_1.markLoanAsPaid);
// Payment routes
router.post("/:id/payments", loanController_1.addPayment); // POST /api/loans/:id/payments - Төлөлт нэмэх
router.get("/:id/payments", loanController_1.getPaymentHistory); // GET /api/loans/:id/payments - Төлөлтийн түүх
router.delete("/:id/payments/:paymentId", loanController_1.deletePayment); // DELETE /api/loans/:id/payments/:paymentId - Төлөлт устгах
exports.default = router;
//# sourceMappingURL=loanRoutes.js.map