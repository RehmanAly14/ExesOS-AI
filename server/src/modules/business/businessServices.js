const prisma = require("../../config/prisma");
const generateUniqueSlug = require("../../utils/UniqueSlug");

const createBusiness = async (data, userId) => {

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: data.workspaceId,
            ownerId: userId
        }
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    // Generate slug
    const slug = await generateUniqueSlug(
        prisma.business,
        data.name
    );

   await prisma.business.create({
    data:{
        workspaceId,

        name,

        slug,

        description,

        industry,

        businessType,

        businessStage,

        website,

        country,

        city,

        timezone,

        currency,

        employees,

        profile: profile || {},

        aiPreferences: aiPreferences || {},

        aiContext:{}
    }
});

    return business;

};

const getWorkspaceBusinesses = async (workspaceId, userId) => {

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            ownerId: userId
        }
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    // Get businesses
    const businesses = await prisma.business.findMany({
        where: {
            workspaceId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return businesses;
};

const getBusinessById = async (id, userId) => {

    const business = await prisma.business.findFirst({
        where: {
            id,
            workspace: {
                ownerId: userId
            }
        }
    });

    if (!business) {
        throw new Error("Business not found");
    }

    return business;
};

const updateBusiness = async (businessId, userId, data) => {

    // Verify business belongs to the logged-in user
    const business = await prisma.business.findFirst({
        where: {
            id: businessId,
            workspace: {
                ownerId: userId,
            },
        },
    });

    if (!business) {
        throw new Error("Business not found");
    }

    // If business name changes, regenerate slug
    let slug = business.slug;

    if (data.name && data.name !== business.name) {
        slug = await generateUniqueSlug(prisma.business, data.name);
    }

    const updatedBusiness = await prisma.business.update({
        where: {
            id: businessId,
        },
        data:{
    name : data.name || business.name,
    slug,

    description : data.description || business.description,

    industry : data.industry || business.industry,

    businessType : data.businessType || business.businessType,

    businessStage : data.businessStage || business.businessStage,

    website : data.website || business.website,

    country : data.country || business.country,

    city : data.city || business.city,

    timezone : data.timezone || business.timezone,

    currency : data.currency || business.currency,

    employees : data.employees || business.employees,

    profile : data.profile || business.profile,

    aiPreferences : data.aiPreferences || business.aiPreferences
}
    });

    return updatedBusiness;
};

const deleteBusiness = async (id, userId) => {

    const business = await prisma.business.findFirst({
        where: {
            id,
            workspace: {
                ownerId: userId
            }
        }
    });

    if (!business) {
        throw new Error("Business not found");
    }

    await prisma.business.delete({
        where: { id }
    });

};

module.exports = {
    createBusiness,
    getWorkspaceBusinesses,
    getBusinessById,
    updateBusiness,
    deleteBusiness
};