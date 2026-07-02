const prisma = require("../../config/prisma");
const generateUniqueSlug = require("../../utils/UniqueSlug");

const createWorkspace = async (userId, data) => {

    const slug = await generateUniqueSlug(prisma.workspace, data.name);

    const workspace = await prisma.workspace.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            ownerId: userId,
        },
    });

    return workspace;
};



const getMyWorkspaces = async (userId) => {

    return await prisma.workspace.findMany({
        where: {
            ownerId: userId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

};
const getWorkspaceById = async (id, userId) => {

    const workspace =
        await prisma.workspace.findFirst({

            where: {
                id,
                ownerId: userId
            }

        });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    return workspace;

}; 

const deleteWorkspace = async (id, userId) => {

    const workspace =
        await prisma.workspace.findFirst({

            where: {
                id,
                ownerId: userId
            }

        });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    await prisma.workspace.delete({
        where: {
            id
        }
    });

};

module.exports = {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById,
    deleteWorkspace
};