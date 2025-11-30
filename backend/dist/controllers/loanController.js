"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanStats = exports.markLoanAsPaid = exports.deletePayment = exports.getPaymentHistory = exports.addPayment = exports.deleteLoan = exports.updateLoan = exports.createLoan = exports.getLoanById = exports.getLoans = void 0;
const db_1 = require("../db");
/**
 * Get all loans for the authenticated user
 */
const getLoans = async (req, res) => {
    try {
        const user = req.user;
        const loans = await db_1.prisma.loan.findMany({
            where: { userId: user.id },
            include: {
                payments: {
                    orderBy: { paymentDate: "desc" },
                },
                _count: {
                    select: { payments: true },
                },
            },
            orderBy: { loanDate: "desc" },
        });
        res.json(loans);
    }
    catch (err) {
        console.error("❌ Error fetching loans:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getLoans = getLoans;
/**
 * Get a specific loan by ID with payment history
 */
const getLoanById = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const loan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
            include: {
                payments: {
                    orderBy: { paymentDate: "desc" },
                },
            },
        });
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        res.json(loan);
    }
    catch (err) {
        console.error("❌ Error fetching loan:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getLoanById = getLoanById;
/**
 * Create a new loan
 */
const createLoan = async (req, res) => {
    try {
        const user = req.user;
        const { amount, description, otherParty, loanDate, dueDate, type } = req.body;
        if (!amount || !otherParty || !type) {
            return res.status(400).json({
                error: "Amount, otherParty, and type are required",
            });
        }
        if (!["BORROWED", "LENT"].includes(type)) {
            return res.status(400).json({
                error: "Type must be either BORROWED or LENT",
            });
        }
        const loan = await db_1.prisma.loan.create({
            data: {
                amount: Number(amount),
                remainingAmount: Number(amount), // Эхлээд үлдэгдэл = нийт дүн
                description,
                otherParty,
                loanDate: loanDate ? new Date(loanDate) : new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                type,
                status: "ACTIVE",
                userId: user.id,
            },
            include: {
                payments: true,
            },
        });
        console.log("✅ Loan created:", loan);
        res.status(201).json(loan);
    }
    catch (err) {
        console.error("❌ Error creating loan:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.createLoan = createLoan;
/**
 * Update a loan
 */
const updateLoan = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { amount, description, otherParty, loanDate, dueDate, status } = req.body;
        const existingLoan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
            include: {
                payments: true,
            },
        });
        if (!existingLoan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        const updateData = {};
        if (amount !== undefined) {
            const newAmount = Number(amount);
            const totalPaid = existingLoan.amount - existingLoan.remainingAmount;
            updateData.amount = newAmount;
            updateData.remainingAmount = Math.max(0, newAmount - totalPaid);
        }
        if (description !== undefined)
            updateData.description = description;
        if (otherParty !== undefined)
            updateData.otherParty = otherParty;
        if (loanDate)
            updateData.loanDate = new Date(loanDate);
        if (dueDate)
            updateData.dueDate = new Date(dueDate);
        if (status && ["ACTIVE", "PAID", "OVERDUE"].includes(status)) {
            updateData.status = status;
        }
        const loan = await db_1.prisma.loan.update({
            where: { id: Number(id) },
            data: updateData,
            include: {
                payments: {
                    orderBy: { paymentDate: "desc" },
                },
            },
        });
        console.log("✅ Loan updated:", loan);
        res.json(loan);
    }
    catch (err) {
        console.error("❌ Error updating loan:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateLoan = updateLoan;
/**
 * Delete a loan
 */
const deleteLoan = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const existingLoan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
        });
        if (!existingLoan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        await db_1.prisma.loan.delete({
            where: { id: Number(id) },
        });
        console.log("✅ Loan deleted:", id);
        res.json({ message: "Loan deleted successfully" });
    }
    catch (err) {
        console.error("❌ Error deleting loan:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteLoan = deleteLoan;
/**
 * Add a payment to a loan (Хэсэгчилэн төлөх)
 */
const addPayment = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { amount, description, paymentDate } = req.body;
        if (!amount || amount <= 0) {
            return res
                .status(400)
                .json({ error: "Valid payment amount is required" });
        }
        const loan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
        });
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        const paymentAmount = Number(amount);
        if (paymentAmount > loan.remainingAmount) {
            return res.status(400).json({
                error: `Зээлийн үлдэгдэл: ${loan.remainingAmount}`,
            });
        }
        // Төлөлт нэмэх
        const payment = await db_1.prisma.payment.create({
            data: {
                amount: paymentAmount,
                description,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                loanId: Number(id),
            },
        });
        // Үлдэгдэл шинэчлэх
        const newRemainingAmount = loan.remainingAmount - paymentAmount;
        const newStatus = newRemainingAmount === 0 ? "PAID" : loan.status;
        const updatedLoan = await db_1.prisma.loan.update({
            where: { id: Number(id) },
            data: {
                remainingAmount: newRemainingAmount,
                status: newStatus,
            },
            include: {
                payments: {
                    orderBy: { paymentDate: "desc" },
                },
            },
        });
        console.log("✅ Payment added:", payment);
        res.json(updatedLoan);
    }
    catch (err) {
        console.error("❌ Error adding payment:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.addPayment = addPayment;
/**
 * Get payment history for a loan
 */
const getPaymentHistory = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const loan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
        });
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        const payments = await db_1.prisma.payment.findMany({
            where: { loanId: Number(id) },
            orderBy: { paymentDate: "desc" },
        });
        res.json(payments);
    }
    catch (err) {
        console.error("❌ Error fetching payment history:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getPaymentHistory = getPaymentHistory;
/**
 * Delete a payment
 */
const deletePayment = async (req, res) => {
    try {
        const user = req.user;
        const { id, paymentId } = req.params;
        const loan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
        });
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        const payment = await db_1.prisma.payment.findFirst({
            where: {
                id: Number(paymentId),
                loanId: Number(id),
            },
        });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }
        // Төлөлт устгах
        await db_1.prisma.payment.delete({
            where: { id: Number(paymentId) },
        });
        // Үлдэгдэл буцааж нэмэх
        const updatedLoan = await db_1.prisma.loan.update({
            where: { id: Number(id) },
            data: {
                remainingAmount: loan.remainingAmount + payment.amount,
                status: "ACTIVE", // Төлөлт устгасан тул буцааж идэвхтэй болгох
            },
            include: {
                payments: {
                    orderBy: { paymentDate: "desc" },
                },
            },
        });
        console.log("✅ Payment deleted:", paymentId);
        res.json(updatedLoan);
    }
    catch (err) {
        console.error("❌ Error deleting payment:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.deletePayment = deletePayment;
/**
 * Mark a loan as paid (бүтэн төлөх)
 */
const markLoanAsPaid = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const loan = await db_1.prisma.loan.findFirst({
            where: {
                id: Number(id),
                userId: user.id,
            },
        });
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }
        // Үлдэгдэл байвал Төлөлт үүсгэх
        if (loan.remainingAmount > 0) {
            await db_1.prisma.payment.create({
                data: {
                    amount: loan.remainingAmount,
                    description: "Бүтэн төлөлт",
                    loanId: Number(id),
                },
            });
        }
        const updatedLoan = await db_1.prisma.loan.update({
            where: { id: Number(id) },
            data: {
                remainingAmount: 0,
                status: "PAID",
            },
            include: {
                payments: {
                    orderBy: { paymentDate: "desc" },
                },
            },
        });
        console.log("✅ Loan marked as paid:", updatedLoan);
        res.json(updatedLoan);
    }
    catch (err) {
        console.error("❌ Error marking loan as paid:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.markLoanAsPaid = markLoanAsPaid;
/**
 * Get loan statistics
 */
const getLoanStats = async (req, res) => {
    try {
        const user = req.user;
        const borrowedLoans = await db_1.prisma.loan.findMany({
            where: {
                userId: user.id,
                type: "BORROWED",
                status: "ACTIVE",
            },
        });
        const lentLoans = await db_1.prisma.loan.findMany({
            where: {
                userId: user.id,
                type: "LENT",
                status: "ACTIVE",
            },
        });
        const totalBorrowed = borrowedLoans.reduce((sum, loan) => sum + loan.remainingAmount, // Үлдэгдэл дүн ашиглах
        0);
        const totalLent = lentLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
        res.json({
            borrowed: {
                count: borrowedLoans.length,
                total: totalBorrowed,
            },
            lent: {
                count: lentLoans.length,
                total: totalLent,
            },
            netBalance: totalLent - totalBorrowed,
        });
    }
    catch (err) {
        console.error("❌ Error fetching loan stats:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getLoanStats = getLoanStats;
//# sourceMappingURL=loanController.js.map