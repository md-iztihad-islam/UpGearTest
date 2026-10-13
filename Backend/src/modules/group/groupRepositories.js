import { prisma } from "../../utils/prisma.js";

export const addGroupRepository = async (data) => {
    try {
        const {
            groupId,
            brandId,
            categoryId,
            subCategoryId,
            insideDhakaCharge,
            outsideDhakaCharge,
            description,
            warrentyId,
            keyFeatures,      // string[]
            tags,             // string[]
            specifications,   // { specificationId, value }[]
            descImageURLs,    // string[]
            filterItems,      // { filterId, filterItemId }[]
        } = data;

        const group = await prisma.group.create({
            data: {
                groupId,
                brandId,
                categoryId,
                subCategoryId,
                insideDhakaCharge,
                outsideDhakaCharge,
                description,
                warrantyId: warrentyId || null,

                // ✅ nested create — each string becomes a KeyFeature row
                keyFeatures: {
                    create: keyFeatures.map((feature, index) => ({
                        feature,
                    })),
                },

                // ✅ nested create — each string becomes a Tag row
                tags: {
                    create: tags.map((tag, index) => ({
                        tag,
                    })),
                },

                // ✅ nested create — each { specificationId, value } becomes a ProductSpecification row
                productSpecifications: {
                    create: specifications.map((spec, index) => ({
                        specificationId: spec.specificationId,
                        value: spec.value,
                    })),
                },

                // ✅ nested create — each URL becomes a DescriptionImage row
                descriptionImages: {
                    create: descImageURLs.map((imageURL, index) => ({
                        imageURL,
                    })),
                },
            },
        });

        return group;
    } catch (error) {
        console.error("Error in addGroupRepository:", error);
        throw error;
    }
};

export const deleteGroupByIdRepository = async (groupId) => {
    try {
        //I need to delete the related key features, tags, specifications, description images before deleting the group to avoid foreign key constraint error
        await prisma.$transaction(async (tx) => {
            await tx.keyFeature.deleteMany({
                where: {
                    groupId,
                },
            });
            await tx.tag.deleteMany({
                where: {
                    groupId,
                },
            });
            await tx.productSpecification.deleteMany({
                where: {
                    groupId,
                },
            });
            await tx.descriptionImage.deleteMany({
                where: {
                    groupId,
                },
            });
        });
        
        const response = await prisma.group.delete({
            where: {
                groupId: groupId,
            },
        });

        return response;
    } catch (error) {
        console.log("Error in deleteGroupByIdRepository:", error);
        return {
            message: "Error deleting group in repository",
        };
    }
};

export const updateGroupByIdRepository = async (groupId, updateData) => {
    try {
        const {
            keyFeatures,
            tags,
            productSpecifications,
            existingDescriptionImages,
            newDescriptionImages,
            ...scalarData
        } = updateData;

        const operations = [];

        operations.push(
            prisma.group.update({
                where: { groupId },
                data: scalarData,
            })
        );

        if (keyFeatures !== undefined) {
            operations.push(prisma.keyFeature.deleteMany({ where: { groupId } }));
            if (keyFeatures.length > 0) {
                operations.push(
                    prisma.keyFeature.createMany({
                        data: keyFeatures.map((feature, index) => ({
                            groupId,
                            feature,
                        })),
                    })
                );
            }
        }

        if (tags !== undefined) {
            operations.push(prisma.tag.deleteMany({ where: { groupId } }));
            if (tags.length > 0) {
                operations.push(
                    prisma.tag.createMany({
                        data: tags.map((tag, index) => ({
                            groupId,
                            tag,
                        })),
                    })
                );
            }
        }

        // productSpecifications is the full list of { specificationId, value }
        // for the group: replace the existing rows so specs can be added,
        // changed or cleared (an empty value removes that spec).
        if (productSpecifications !== undefined) {
            operations.push(prisma.productSpecification.deleteMany({ where: { groupId } }));

            const specsToSave = productSpecifications.filter(
                (spec) => spec.specificationId && String(spec.value ?? "").trim() !== ""
            );
            if (specsToSave.length > 0) {
                operations.push(
                    prisma.productSpecification.createMany({
                        data: specsToSave.map((spec) => ({
                            groupId,
                            specificationId: spec.specificationId,
                            value: String(spec.value).trim(),
                        })),
                    })
                );
            }
        }

        // DescriptionImage has no order column; images are read ordered by
        // createdAt, so the chosen order is stored by stamping them 1ms apart.
        const orderBase = Date.now();
        const orderedAt = (position) => new Date(orderBase + position);

        if (existingDescriptionImages !== undefined) {
            const keptIds = existingDescriptionImages.map((img) => img.descriptionImageId);

            operations.push(
                prisma.descriptionImage.deleteMany({
                    where: {
                        groupId,
                        descriptionImageId: { notIn: keptIds },
                    },
                })
            );

            existingDescriptionImages.forEach((img, index) => {
                operations.push(
                    prisma.descriptionImage.update({
                        where: { descriptionImageId: img.descriptionImageId },
                        data: { createdAt: orderedAt(img.position ?? index) },
                    })
                );
            });
        }

        if (newDescriptionImages?.length > 0) {
            operations.push(
                prisma.descriptionImage.createMany({
                    data: newDescriptionImages.map((img, index) => ({
                        groupId,
                        imageURL: img.imageURL,
                        createdAt: orderedAt(img.position ?? (existingDescriptionImages?.length ?? 0) + index),
                    })),
                })
            );
        }

        const results = await prisma.$transaction(operations);

        return results[0]; // the updated Group record
    } catch (error) {
        console.log("Error in updateGroupByIdRepository:", error);
        return {
            message: "Error updating group in repository",
        };
    }
};

export const getAllGroupsRepository = async () => {
    try {
        //I need the title of category and subcategory in the response, so I am using include to fetch the related data
        //I also need brand, key features, tags, specifications, description images in the response, so I will include them as well
        const response = await prisma.group.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                category: {
                    select: {
                        title: true,
                    },
                },
                subCategory: {
                    select: {
                        title: true,
                    },
                },
                brand: {
                    select: {
                        title: true,
                    },
                },
                keyFeatures: {
                    select: {
                        feature: true,
                    },
                },
                tags: {
                    select: {
                        tag: true,
                    },
                },
                productSpecifications: {
                    select: {
                        specificationId: true,
                        value: true,
                    },
                },
                descriptionImages: {
                    select: {
                        descriptionImageId: true,
                        imageURL: true,
                    },
                },
            },
        });

        return response;
    } catch (error) {
        console.log("Error in getAllGroupsRepository:", error);
        return {
            message: "Error fetching groups in repository",
        };
    }
};

export const getGroupByIdRepository = async (groupId) => {
    try {
        const response = await prisma.group.findUnique({
            where: {
                groupId: groupId,
            },
            include: {
                category: {
                    select: {
                        title: true,
                    },
                },
                subCategory: {
                    select: {
                        title: true,
                    },
                },
                brand: {
                    select: {
                        title: true,
                    },
                },
                keyFeatures: {
                    select: {
                        feature: true,
                    },
                },
                tags: {
                    select: {
                        tag: true,
                    },
                },
                productSpecifications: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        productSpecificationId: true,
                        specificationId: true,
                        value: true,
                        specification: {
                            select: { title: true },
                        },
                    },
                },
                descriptionImages: {
                    select: {
                        descriptionImageId: true,
                        imageURL: true,
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        return response;
    } catch (error) {
        console.log("Error in getGroupByIdRepository:", error);
        return {
            message: "Error fetching group by ID in repository",
        };
    }
};

export const searchGroupsByKeywordRepository = async (keyword, limit, page, skip) => {
    try {
        console.log("Searching groups with keyword:", keyword, "limit:", limit, "page:", page, "skip:", skip);
        const where = keyword
            ? {
                OR: [
                    { description: { contains: keyword, mode: "insensitive" } },
                    { keyFeatures: { some: { feature: { contains: keyword, mode: "insensitive" } } } },
                    { tags: { some: { tag: { contains: keyword, mode: "insensitive" } } } },
                    {
                        products: {
                            some: {
                                OR: [
                                    { title: { contains: keyword, mode: "insensitive" } },
                                    { subTitle: { contains: keyword, mode: "insensitive" } },
                                ],
                            },
                        },
                    },
                ],
              }
            : {};

        const [groups, total] = await prisma.$transaction([
            prisma.group.findMany({ where, take: limit, skip }),
            prisma.group.count({ where }),
        ]);

        console.log("Groups found:", groups.length, "Total matching groups:", total);

        return { data: groups, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.log("Error in searchGroupsByKeywordRepository:", error);
        throw error;
    }
};