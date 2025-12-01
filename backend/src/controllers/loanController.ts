import { Request, Response } from "express";
import { prisma } from "../db";

/**
 * Get all loans for the authenticated user
 */
export const getLoans = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      include: {
        customer: true, // Харилцагчийн мэдээлэл нэмэх
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
  } catch (err) {
    console.error("❌ Error fetching loans:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get a specific loan by ID with payment history
 */
export const getLoanById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const loan = await prisma.loan.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res.json(loan);
  } catch (err) {
    console.error("❌ Error fetching loan:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Create a new loan
 */
export const createLoan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      amount,
      description,
      otherParty,
      customerId,
      loanDate,
      dueDate,
      type,
    } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        error: "Amount and type are required",
      });
    }

    if (!["BORROWED", "LENT"].includes(type)) {
      return res.status(400).json({
        error: "Type must be either BORROWED or LENT",
      });
    }

    // customerId эсвэл otherParty заавал байх ёстой
    if (!customerId && !otherParty) {
      return res.status(400).json({
        error: "Either customerId or otherParty is required",
      });
    }

    // Харилцагч сонгосон бол шалгах
    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: Number(customerId),
          userId: user.id,
        },
      });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
    }

    const loan = await prisma.loan.create({
      data: {
        amount: Number(amount),
        remainingAmount: Number(amount),
        description,
        otherParty: otherParty || "",
        customerId: customerId ? Number(customerId) : null,
        loanDate: loanDate ? new Date(loanDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        type,
        status: "ACTIVE",
        userId: user.id,
      },
      include: {
        customer: true,
        payments: true,
      },
    });

    console.log("✅ Loan created:", loan);
    res.status(201).json(loan);
  } catch (err) {
    console.error("❌ Error creating loan:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update a loan
 */
export const updateLoan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const {
      amount,
      description,
      otherParty,
      customerId,
      loanDate,
      dueDate,
      status,
    } = req.body;

    const existingLoan = await prisma.loan.findFirst({
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

    // Харилцагч өөрчлөх бол шалгах
    if (customerId !== undefined && customerId !== null) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: Number(customerId),
          userId: user.id,
        },
      });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
    }

    const updateData: any = {};
    if (amount !== undefined) {
      const newAmount = Number(amount);
      const totalPaid = existingLoan.amount - existingLoan.remainingAmount;
      updateData.amount = newAmount;
      updateData.remainingAmount = Math.max(0, newAmount - totalPaid);
    }
    if (description !== undefined) updateData.description = description;
    if (otherParty !== undefined) updateData.otherParty = otherParty;
    if (customerId !== undefined)
      updateData.customerId = customerId ? Number(customerId) : null;
    if (loanDate) updateData.loanDate = new Date(loanDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status && ["ACTIVE", "PAID", "OVERDUE"].includes(status)) {
      updateData.status = status;
    }

    const loan = await prisma.loan.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    console.log("✅ Loan updated:", loan);
    res.json(loan);
  } catch (err) {
    console.error("❌ Error updating loan:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete a loan
 */
export const deleteLoan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existingLoan = await prisma.loan.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    await prisma.loan.delete({
      where: { id: Number(id) },
    });

    console.log("✅ Loan deleted:", id);
    res.json({ message: "Loan deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting loan:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Add a payment to a loan (Хэсэгчилэн төлөх)
 */
export const addPayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { amount, description, paymentDate } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid payment amount is required" });
    }

    const loan = await prisma.loan.findFirst({
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
        error: `Зээлийн үлдэгдэл: ${loan.remainingAmount} байгаа тул тохируулан төлнө үү`,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        amount: paymentAmount,
        description,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        loanId: Number(id),
      },
    });

    const newRemainingAmount = loan.remainingAmount - paymentAmount;
    const newStatus = newRemainingAmount === 0 ? "PAID" : loan.status;

    const updatedLoan = await prisma.loan.update({
      where: { id: Number(id) },
      data: {
        remainingAmount: newRemainingAmount,
        status: newStatus,
      },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    console.log("✅ Payment added:", payment);
    res.json(updatedLoan);
  } catch (err) {
    console.error("❌ Error adding payment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get payment history for a loan
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const loan = await prisma.loan.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const payments = await prisma.payment.findMany({
      where: { loanId: Number(id) },
      orderBy: { paymentDate: "desc" },
    });

    res.json(payments);
  } catch (err) {
    console.error("❌ Error fetching payment history:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete a payment
 */
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id, paymentId } = req.params;

    const loan = await prisma.loan.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: Number(paymentId),
        loanId: Number(id),
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    await prisma.payment.delete({
      where: { id: Number(paymentId) },
    });

    const updatedLoan = await prisma.loan.update({
      where: { id: Number(id) },
      data: {
        remainingAmount: loan.remainingAmount + payment.amount,
        status: "ACTIVE",
      },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    console.log("✅ Payment deleted:", paymentId);
    res.json(updatedLoan);
  } catch (err) {
    console.error("❌ Error deleting payment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Mark a loan as paid (бүтэн төлөх)
 */
export const markLoanAsPaid = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const loan = await prisma.loan.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.remainingAmount > 0) {
      await prisma.payment.create({
        data: {
          amount: loan.remainingAmount,
          description: "Бүтэн төлөлт",
          loanId: Number(id),
        },
      });
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: Number(id) },
      data: {
        remainingAmount: 0,
        status: "PAID",
      },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    console.log("✅ Loan marked as paid:", updatedLoan);
    res.json(updatedLoan);
  } catch (err) {
    console.error("❌ Error marking loan as paid:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get loan statistics
 */
export const getLoanStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const borrowedLoans = await prisma.loan.findMany({
      where: {
        userId: user.id,
        type: "BORROWED",
        status: "ACTIVE",
      },
    });

    const lentLoans = await prisma.loan.findMany({
      where: {
        userId: user.id,
        type: "LENT",
        status: "ACTIVE",
      },
    });

    const totalBorrowed = borrowedLoans.reduce(
      (sum, loan) => sum + loan.remainingAmount,
      0
    );
    const totalLent = lentLoans.reduce(
      (sum, loan) => sum + loan.remainingAmount,
      0
    );

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
  } catch (err) {
    console.error("❌ Error fetching loan stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};
