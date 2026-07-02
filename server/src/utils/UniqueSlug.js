const slugify = require("./slugify");

/**
 * Generates a unique slug for any Prisma model.
 *
 * @param {Object} model - Prisma model (prisma.workspace, prisma.business)
 * @param {String} name
 */
const generateUniqueSlug = async (model, name) => {
    const baseSlug = slugify(name);

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const exists = await model.findUnique({
            where: { slug }
        });

        if (!exists) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
};

module.exports = generateUniqueSlug;