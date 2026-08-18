// import { prisma } from "../../utils/prisma.js";

// const MIN_STOCK_ID = 100000;
// const MAX_STOCK_ID = 999999;
// const MAX_GENERATION_ATTEMPTS = 20;

// const generateSixDigitStockId = () =>
// 	String(Math.floor(Math.random() * (MAX_STOCK_ID - MIN_STOCK_ID + 1)) + MIN_STOCK_ID);

// const generateUniqueSixDigitStockId = async () => {
// 	for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
// 		const candidateId = generateSixDigitStockId();
// 		const existingStock = await prisma.stock.findUnique({
// 			where: { stockId: candidateId },
// 			select: { stockId: true },
// 		});

// 		if (!existingStock) {
// 			return candidateId;
// 		}
// 	}

// 	throw new Error("Unable to generate a unique 6-digit stockId");
// };

// const buildSerialNumbersForStock = (productId, stockId, quantity) => {
// 	return Array.from({ length: quantity }, (_, index) => {
// 		const numberOfProduct = String(index + 1).padStart(5, "0");

// 		return {
// 			serialNumber: `${productId}${stockId}${numberOfProduct}`,
// 			stockId,
// 		};
// 	});
// };

// export const addStockRepository = async (stockData) => {
//     try {
//         for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
//             try {
//                 const generatedStockId = await generateUniqueSixDigitStockId();
//                 const quantity = Number(stockData.quantity);
//                 const serialNumbers = buildSerialNumbersForStock(
//                     stockData.productId,
//                     generatedStockId,
//                     quantity,
//                 );

//                 const response = await prisma.$transaction(async (tx) => {
//                     const createdStock = await tx.stock.create({
//                         data: {
//                             ...stockData,
//                             stockId: generatedStockId,
//                         },
//                     });

//                     if (serialNumbers.length > 0) {
//                         await tx.serialNumber.createMany({
//                             data: serialNumbers,
//                         });
//                     }

//                     return createdStock;
//                 });

//                 return response;
//             } catch (error) {
//                 const isDuplicateStockId =
//                     error?.code === "P2002" &&
//                     Array.isArray(error?.meta?.target) &&
//                     error.meta.target.includes("StockId");

//                 if (!isDuplicateStockId) {
//                     throw error;
//                 }
//             }
//         }

//         throw new Error("Unable to create stock with a unique 6-digit stockId");
//     } catch (error) {
//         console.log("Error in addStockRepository:", error);
//         return {
//             message: "Error adding stock in repository",
//         };
//     }
// };

// export const deleteStockByIdRepository = async (stockId) => {
//     try {
//         const response = await prisma.$transaction(async (tx) => {
//             await tx.serialNumber.deleteMany({
//                 where: {
//                     stockId: stockId,
//                 },
//             });

//             return tx.stock.delete({
//                 where: {
//                     stockId: stockId,
//                 },
//             });
//         });
//         return response;
//     } catch (error) {
//         console.log("Error in deleteStockByIdRepository:", error);
//         return {
//             message: "Error deleting stock in repository",
//         };
//     }
// };

// export const updateStockByIdRepository = async (stockId, updateData) => {
//     try {
//         const response = await prisma.stock.update({
//             where: {
//                 stockId: stockId,
//             },
//             data: updateData,
//         });
//         return response;
//     } catch (error) {
//         console.log("Error in updateStockByIdRepository:", error);
//         return {
//             message: "Error updating stock in repository",
//         };
//     }
// };

// export const getAllStocksRepository = async () => {
//     try {
//         const response = await prisma.stock.findMany({
//             include: {
//                 serialNumbers: {
//                     orderBy: {
//                         serialNumber: "asc",
//                     },
//                 },
//             },
//             orderBy: {
//                 createdAt: "desc",
//             },
//         });
//         return response;
//     } catch (error) {
//         console.log("Error in getAllStocksRepository:", error);
//         return {
//             message: "Error fetching stocks in repository",
//         };
//     }
// };

// export const getStockByIdRepository = async (stockId) => {
//     try {
//         const response = await prisma.stock.findUnique({
//             where: {
//                 stockId: stockId,
//             },
//             include: {
//                 serialNumbers: {
//                     orderBy: {
//                         serialNumber: "asc",
//                     },
//                 },
//             },
//         });
//         return response;
//     } catch (error) {
//         console.log("Error in getStockByIdRepository:", error);
//         return {
//             message: "Error fetching stock by ID in repository",
//         };
//     }
// };

// export const getStocksByProductIdRepository = async (productId) => {
//     try {
//         const response = await prisma.stock.findMany({
//             where: {
//                 productId: productId,
//                 remaining: {
//                     gt: 0,
//                 },
//             },
//             include: {
//                 serialNumbers: {
//                     orderBy: {
//                         serialNumber: "asc",
//                     },
//                 },
//             },
//             orderBy: {
//                 createdAt: "desc",
//             },
//         });
//         return response;    
//     } catch (error) {
//         console.log("Error in getStocksByProductIdRepository:", error);
//         return {
//             message: "Error fetching stocks by product ID in repository",
//         };
//     }
// }

// export const reserveStockQuantityRepository = async (productId, quantity, tx=prisma) => {
//     try {
//         //This function will reserve only one stock at a time. If the stock has enough quantity to reserve, it will reserve that stock and return the stockId of that stock. If the stock does not have enough quantity to reserve, it will find the next stock that has enough quantity to reserve and reserve that stock. It will keep doing this until it finds a stock that has enough quantity to reserve or until it runs out of stocks. If it runs out of stocks, it will throw an error.
//         //Maybe in one stock there is not enough quantity to reserve, so I will find the first stock that has enough quantity to reserve and then I will decrement the remaining quantity of that stock by the quantity to reserve. I will return the stockId of the stock that has been reserved. But if a single stock cannot fulfill the required quantity, maybe I will need to reserve from multiple stocks. So I will find all the stocks that have enough quantity to reserve and then I will decrement the remaining quantity of those stocks by the quantity to reserve. I will return the stockIds of the stocks that have been reserved.

//         const stocks = await tx.stock.findMany({
//             where: {
//                 productId: productId,
//                 remaining: {
//                     gt: 0,
//                 },
//             },
//             include: {
//                 serialNumbers: {
//                     where: {
//                         isInWarehouse: true,
//                     },
//                     orderBy: {
//                         serialNumber: "asc",
//                     },
//                 },
//             },
//             orderBy: {
//                 remaining: "desc",
//             },
//         });

//         // console.log("Stocks fetched for reservation:", stocks);

//         let remainingQuantityToReserve = quantity;
//         const reservedStockIds = [];
//         let reservedSerialNumbers = [];

//         for (const stock of stocks) {
//             if (remainingQuantityToReserve <= 0) {
//                 break;
//             }
//             const quantityToReserveFromThisStock = Math.min(stock.remaining, remainingQuantityToReserve);

//             const serialNumberIds = stock.serialNumbers.slice(0, quantityToReserveFromThisStock).map(sn => sn.serialNumber);
//             reservedSerialNumbers = reservedSerialNumbers.concat(serialNumberIds);

//             // console.log(`Reserving ${quantityToReserveFromThisStock} from stockId ${stock.stockId}, serialNumberIds:`, serialNumberIds);

//             await tx.stock.update({
//                 where: {
//                     stockId: stock.stockId,
//                 },
//                 data: {
//                     reserved: {
//                         increment: quantityToReserveFromThisStock,
//                     },
//                 },
//             });

//             await tx.serialNumber.updateMany({
//                 where: {
//                     serialNumber: { in: serialNumberIds },
//                 },
//                 data: {
//                     isInWarehouse: false,
//                 },
//             });


//             reservedStockIds.push(stock.stockId);
//             remainingQuantityToReserve -= quantityToReserveFromThisStock;
//         }

//         if (remainingQuantityToReserve > 0) {
//             throw new Error("Not enough stock available to reserve the requested quantity");
//         }

//         return {reservedStockIds, reservedSerialNumbers};
//     } catch (error) {
//         console.log("Error in reserveStockQuantityRepository:", error);
//         return {
//             message: "Error reserving stock quantity in repository",
//         };
//     }   
// }

// export const releaseReservedStockQuantityRepository = async (stockId, serialNumber, tx=prisma) => {
//     try {
//         await tx.stock.update({
//             where: {
//                 stockId: stockId,
//             },
//             data: {
//                 reserved: {
//                     decrement: 1,
//                 },
//             },
//         });

//         await tx.serialNumber.update({
//             where: {
//                 serialNumber: serialNumber,
//             },
//             data: {
//                 isInWarehouse: true,
//             },
//         });
//     } catch (error) {
//         console.log("Error in releaseReservedStockQuantityRepository:", error);
//         throw error;
//     }
// }

// export const decreaseRemainingStockQuantityRepository = async (stockId, tx=prisma) => {
//     try {
//         const response = await tx.stock.update({
//             where: {
//                 stockId: stockId,
//             },
//             data: {
//                 remaining: {
//                     decrement: 1,
//                 },
//                 reserved: {
//                     decrement: 1,
//                 }
//             },
//         });
//         return response;
//     } catch (error) {
//         console.log("Error in decreaseRemainingStockQuantityRepository:", error);
//         throw error;
//     }
// }

// export const decreaseOnlyRemainingStockQuantityRepository = async (stockId, serialNumber, tx=prisma) => {
//     try {
//         await tx.stock.update({
//             where: {
//                 stockId: stockId,
//             },
//             data: {
//                 remaining: {
//                     decrement: 1,
//                 },
//             },
//         });

//         await tx.serialNumber.update({
//             where: {
//                 serialNumber: serialNumber,
//             },
//             data: {
//                 isInWarehouse: false,
//             },
//         });

//     } catch (error) {
//         console.log("Error in decreaseOnlyRemainingStockQuantityRepository:", error);
//         throw error;
//     }
// }


import { prisma } from "../../utils/prisma.js";

const MIN_STOCK_ID = 100000;
const MAX_STOCK_ID = 999999;
const MAX_GENERATION_ATTEMPTS = 20;

const generateSixDigitStockId = () =>
    String(Math.floor(Math.random() * (MAX_STOCK_ID - MIN_STOCK_ID + 1)) + MIN_STOCK_ID);

const generateUniqueSixDigitStockId = async (tx = prisma) => {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
        const candidateId = generateSixDigitStockId();
        const existingStock = await tx.stock.findUnique({
            where: { stockId: candidateId },
            select: { stockId: true },
        });

        if (!existingStock) {
            return candidateId;
        }
    }

    throw new Error("Unable to generate a unique 6-digit stockId");
};

const buildSerialNumbersForStock = (productId, stockId, quantity) => {
    return Array.from({ length: quantity }, (_, index) => {
        const numberOfProduct = String(index + 1).padStart(5, "0");
        return {
            serialNumber: `${productId}${stockId}${numberOfProduct}`,
            stockId,
        };
    });
};

// Generates the id AND does the writes inside the SAME transaction, so a
// stockId collision can't slip in between the two (previously they used
// separate connections, opening a small race window).
export const addStockRepository = async (stockData) => {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
        try {
            return await prisma.$transaction(async (tx) => {
                const generatedStockId = await generateUniqueSixDigitStockId(tx);
                const quantity = Number(stockData.quantity);
                const serialNumbers = buildSerialNumbersForStock(
                    stockData.productId,
                    generatedStockId,
                    quantity,
                );

                const createdStock = await tx.stock.create({
                    data: { ...stockData, stockId: generatedStockId },
                });

                if (serialNumbers.length > 0) {
                    await tx.serialNumber.createMany({ data: serialNumbers });
                }

                return createdStock;
            });
        } catch (error) {
            const isDuplicateStockId =
                error?.code === "P2002" &&
                Array.isArray(error?.meta?.target) &&
                error.meta.target.includes("StockId");

            if (!isDuplicateStockId) {
                console.log("Error in addStockRepository:", error);
                throw error; // real error — let the caller know
            }
            // else: collision, loop and retry with a new id
        }
    }

    throw new Error("Unable to create stock with a unique 6-digit stockId");
};

export const deleteStockByIdRepository = async (stockId) => {
    return prisma.$transaction(async (tx) => {
        await tx.serialNumber.deleteMany({ where: { stockId } });
        return tx.stock.delete({ where: { stockId } });
    });
};

export const updateStockByIdRepository = async (stockId, updateData) => {
    return prisma.stock.update({ where: { stockId }, data: updateData });
};

export const getAllStocksRepository = async () => {
    return prisma.stock.findMany({
        include: { serialNumbers: { orderBy: { serialNumber: "asc" } } },
        orderBy: { createdAt: "desc" },
    });
};

export const getStockByIdRepository = async (stockId) => {
    return prisma.stock.findUnique({
        where: { stockId },
        include: { serialNumbers: { orderBy: { serialNumber: "asc" } } },
    });
};

export const getStocksByProductIdRepository = async (productId) => {
    return prisma.stock.findMany({
        where: { productId, remaining: { gt: 0 } },
        include: { serialNumbers: { orderBy: { serialNumber: "asc" } } },
        orderBy: { createdAt: "desc" },
    });
};

// Reserves `quantity` units of a product, pulling from whichever stocks
// have availability, largest remaining first. Returns the stockIds touched
// and the serial numbers reserved. Throws if it can't fulfill the quantity —
// callers MUST let this propagate (don't swallow it) so a failed reservation
// correctly rolls back the surrounding order transaction.
export const reserveStockQuantityRepository = async (productId, quantity, tx = prisma) => {
    const stocks = await tx.stock.findMany({
        where: { productId, remaining: { gt: 0 } },
        include: {
            serialNumbers: {
                where: { isInWarehouse: true },
                orderBy: { serialNumber: "asc" },
            },
        },
        orderBy: { remaining: "desc" },
    });

    let remainingQuantityToReserve = quantity;
    const reservedStockIds = [];
    let reservedSerialNumbers = [];

    for (const stock of stocks) {
        if (remainingQuantityToReserve <= 0) break;

        // Cap by BOTH the stock's declared `remaining` count AND how many
        // serials are actually flagged in-warehouse. If those two numbers
        // ever drift apart (bad data), we reserve only what we can prove
        // exists, instead of promising a serial number that isn't there.
        const availableSerials = stock.serialNumbers.length;
        const quantityToReserveFromThisStock = Math.min(
            stock.remaining,
            availableSerials,
            remainingQuantityToReserve,
        );

        if (quantityToReserveFromThisStock <= 0) continue;

        const serialNumberIds = stock.serialNumbers
            .slice(0, quantityToReserveFromThisStock)
            .map((sn) => sn.serialNumber);

        await tx.stock.update({
            where: { stockId: stock.stockId },
            data: { reserved: { increment: quantityToReserveFromThisStock } },
        });

        await tx.serialNumber.updateMany({
            where: { serialNumber: { in: serialNumberIds } },
            data: { isInWarehouse: false },
        });

        reservedSerialNumbers = reservedSerialNumbers.concat(serialNumberIds);
        reservedStockIds.push(stock.stockId);
        remainingQuantityToReserve -= quantityToReserveFromThisStock;
    }

    if (remainingQuantityToReserve > 0) {
        throw new Error(
            `Not enough stock available for product ${productId}: ` +
            `requested ${quantity}, short by ${remainingQuantityToReserve}`
        );
    }

    return { reservedStockIds, reservedSerialNumbers };
};

export const releaseReservedStockQuantityRepository = async (stockId, serialNumber, tx = prisma) => {
    await tx.stock.update({
        where: { stockId },
        data: { reserved: { decrement: 1 } },
    });

    await tx.serialNumber.update({
        where: { serialNumber },
        data: { isInWarehouse: true },
    });
};

export const decreaseRemainingStockQuantityRepository = async (stockId, tx = prisma) => {
    return tx.stock.update({
        where: { stockId },
        data: {
            remaining: { decrement: 1 },
            reserved: { decrement: 1 },
        },
    });
};

export const decreaseOnlyRemainingStockQuantityRepository = async (stockId, serialNumber, tx = prisma) => {
    await tx.stock.update({
        where: { stockId },
        data: { remaining: { decrement: 1 } },
    });

    await tx.serialNumber.update({
        where: { serialNumber },
        data: { isInWarehouse: false },
    });
};