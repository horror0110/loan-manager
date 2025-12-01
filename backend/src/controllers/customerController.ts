import { Request, Response } from "express";
import { prisma } from "../db";

/**
 * Get all customers for the authenticated user
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const customers = await prisma.customer.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { loans: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(customers);
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get a specific customer by ID
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
      include: {
        loans: {
          orderBy: { loanDate: "desc" },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Create a new customer
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, register, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    // Регистрийн дугаар давхцаж байгаа эсэхийг шалгах
    if (register) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          register,
        },
      });

      if (existingCustomer) {
        return res.status(400).json({
          error:
            "Энэ регистрийн дугаартай харилцагч аль хэдийн бүртгэлтэй байна",
        });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        register,
        phone,
        userId: user.id,
      },
    });

    console.log("✅ Customer created:", customer);
    res.status(201).json(customer);
  } catch (err) {
    console.error("❌ Error creating customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update a customer
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, register, phone } = req.body;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Регистр өөрчлөх үед давхцаж байгаа эсэхийг шалгах
    if (register && register !== existingCustomer.register) {
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          register,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (duplicateCustomer) {
        return res.status(400).json({
          error:
            "Энэ регистрийн дугаартай харилцагч аль хэдийн бүртгэлтэй байна",
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (register !== undefined) updateData.register = register;
    if (phone !== undefined) updateData.phone = phone;

    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: updateData,
    });

    console.log("✅ Customer updated:", customer);
    res.json(customer);
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete a customer
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
      include: {
        _count: {
          select: { loans: true },
        },
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Зээлтэй холбоотой эсэхийг шалгах
    if (existingCustomer._count.loans > 0) {
      return res.status(400).json({
        error: "Энэ харилцагчтай холбоотой зээл байгаа тул устгах боломжгүй",
      });
    }

    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    console.log("✅ Customer deleted:", id);
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
      include: {
        loans: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const borrowedLoans = customer.loans.filter(
      (loan) => loan.type === "BORROWED"
    );
    const lentLoans = customer.loans.filter((loan) => loan.type === "LENT");

    const totalBorrowed = borrowedLoans.reduce(
      (sum, loan) => sum + loan.remainingAmount,
      0
    );
    const totalLent = lentLoans.reduce(
      (sum, loan) => sum + loan.remainingAmount,
      0
    );

    const totalBorrowedAmount = borrowedLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );
    const totalLentAmount = lentLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );

    res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        register: customer.register,
        phone: customer.phone,
      },
      borrowed: {
        count: borrowedLoans.length,
        totalAmount: totalBorrowedAmount,
        remaining: totalBorrowed,
      },
      lent: {
        count: lentLoans.length,
        totalAmount: totalLentAmount,
        remaining: totalLent,
      },
      netBalance: totalLent - totalBorrowed,
    });
  } catch (err) {
    console.error("❌ Error fetching customer stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};
