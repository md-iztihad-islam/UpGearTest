import { prisma } from "../../utils/prisma.js";

export const addExpenseRepository = async (expenseData) => {
    try {
        const response = await prisma.expense.create({
            data: expenseData,
        });
        return response;
    } catch (error) {
        console.log("Error in addExpenseRepository:", error);
        return {
            message: "Error adding expense in repository",
        };
    }
};

export const deleteExpenseByIdRepository = async (expenseId) => {
    try {
        const response = await prisma.expense.delete({
            where: {
                expenseId: expenseId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteExpenseByIdRepository:", error);
        return {
            message: "Error deleting expense in repository",
        };
    }
};

export const updateExpenseByIdRepository = async (expenseId, updateData) => {
    try {
        const response = await prisma.expense.update({
            where: {
                expenseId: expenseId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateExpenseByIdRepository:", error);
        return {
            message: "Error updating expense in repository",
        };
    }
};

export const getAllExpensesRepository = async () => {
    try {
        const response = await prisma.expense.findMany({
            include: {
                employee: {
                    select: {
                        employeeId: true,
                        name: true,
                        email: true,
                        phone: true,
                        // imageUrl: true,
                        role: true,
                        status: true,
                        store: {
                            select: {
                                storeId: true,
                                title: true,
                            }
                        }
                    },
                }, 
            },
            orderBy: {
                date: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllExpensesRepository:", error);
        return {
            message: "Error fetching expenses in repository",
        };
    }
};

export const getExpenseByIdRepository = async (expenseId) => {
    try {
        const response = await prisma.expense.findUnique({
            where: {
                expenseId: expenseId,
            },
            include: {
                employee: {
                    select: {
                        employeeId: true,
                        name: true,
                        email: true,
                        phone: true,
                        // imageUrl: true,
                        role: true,
                        status: true,
                        store: {
                            select: {
                                storeId: true,
                                title: true,
                            }
                        }
                    },
                }, 
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getExpenseByIdRepository:", error);
        return {
            message: "Error fetching expense by ID in repository",
        };
    }
};

export const getExpensesByEmployeeIdRepository = async (employeeId) => {
    try {
        const response = await prisma.expense.findMany({
            where: {
                employeeId: employeeId,
            },
            include: {
                employee: {
                    select: {
                        employeeId: true,
                        name: true,
                        email: true,
                        phone: true,
                        // imageUrl: true,
                        role: true,
                        status: true,
                        store: {
                            select: {
                                storeId: true,
                                title: true,
                            }
                        }
                    },
                }, 
            },
            orderBy: {
                date: "desc",
            }
        });
        return response;
    } catch (error) {
        console.log("Error in getExpensesByEmployeeRepository:", error);
        return {
            message: "Error fetching expenses by employee in repository",
        };
    }
};

export const getExpensesByDateRangeRepository = async (startDate, endDate) => {
    try {
        const response = await prisma.expense.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                employee: {
                    select: {
                        employeeId: true,
                        name: true,
                        email: true,
                        phone: true,
                        // imageUrl: true,
                        role: true,
                        status: true,
                        store: {
                            select: {
                                storeId: true,
                                title: true,
                            }
                        }
                    },
                }, 
            },
            orderBy: {
                date: "desc",
            }
        });
        return response;
    } catch (error) {
        console.log("Error in getExpensesByDateRangeRepository:", error);
        return {
            message: "Error fetching expenses by date range in repository",
        };
    }
};