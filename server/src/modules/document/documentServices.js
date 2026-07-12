const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const prisma = require("../../config/prisma");
const { EmbeddingPipeline } = require("../../ai/embeddings/processor/EmbeddingPipeline");

const embeddingPipeline = new EmbeddingPipeline();

const EXTRACTABLE_TYPES = {
    pdf: extractFromPdf,
    docx: extractFromDocx,
    txt: extractFromTxt,
};

async function extractFromPdf(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
}

async function extractFromDocx(filePath) {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

async function extractFromTxt(filePath) {
    return fs.readFileSync(filePath, "utf-8");
}

const verifyBusinessOwnership = async (businessId, userId) => {

    const business = await prisma.business.findFirst({
        where: {
            id: businessId,
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

const uploadDocument = async (businessId, userId, file) => {

    await verifyBusinessOwnership(businessId, userId);

    const fileType = path.extname(file.originalname).slice(1).toLowerCase();

    console.log(`[DocumentService] Upload started: ${file.originalname} (business: ${businessId})`);

    const document = await prisma.document.create({
        data: {
            businessId,
            filename: file.originalname,
            fileType,
            fileSize: file.size,
            storagePath: file.path,
            status: "processing"
        }
    });

    console.log(`[DocumentService] Document created: ${document.id} (status: processing)`);

    try {
        const extractText = EXTRACTABLE_TYPES[fileType];

        if (!extractText) {
            throw new Error(`Unsupported file type: ${fileType}`);
        }

        console.log(`[DocumentService] Extracting text for document: ${document.id}`);
        const extractedText = await extractText(file.path);

        if (!extractedText || !extractedText.trim()) {
            throw new Error("No text could be extracted from this file");
        }

        console.log(
            `[DocumentService] Extraction complete for document: ${document.id} ` +
            `(${extractedText.length} characters)`
        );

        const updatedDocument = await prisma.document.update({
            where: { id: document.id },
            data: {
                extractedText,
                status: "extracted"
            }
        });

        console.log(`[DocumentService] Document status updated: ${document.id} → extracted`);

        try {
            await embeddingPipeline.processDocument(updatedDocument.id);
        } catch (embeddingError) {
            console.error(
                `[DocumentService] Embedding failed for document ${updatedDocument.id}:`,
                embeddingError.message
            );
        }

        return prisma.document.findUnique({
            where: { id: updatedDocument.id }
        });
    } catch (err) {
        console.error(`[DocumentService] Upload/extraction failed for document ${document.id}:`, err.message);

        return await prisma.document.update({
            where: { id: document.id },
            data: { status: "failed" }
        });
    }
};

const getBusinessDocuments = async (businessId, userId, status) => {

    await verifyBusinessOwnership(businessId, userId);

    return prisma.document.findMany({
        where: {
            businessId,
            ...(status && { status })
        },
        orderBy: { createdAt: "desc" }
    });
};

const getDocumentById = async (id, userId) => {

    const document = await prisma.document.findFirst({
        where: {
            id,
            business: {
                workspace: {
                    ownerId: userId
                }
            }
        }
    });

    if (!document) {
        throw new Error("Document not found");
    }

    return document;
};

const updateEmbeddingStatus = async (id, userId, embeddingStatus) => {

    const document = await getDocumentById(id, userId);

    return prisma.document.update({
        where: { id: document.id },
        data: { embeddingStatus }
    });
};

const deleteDocument = async (id, userId) => {

    const document = await getDocumentById(id, userId);

    await prisma.document.delete({
        where: { id }
    });

    fs.unlink(document.storagePath, (err) => {
        if (err) {
            console.error(`Failed to delete file ${document.storagePath}:`, err.message);
        }
    });
};

module.exports = {
    uploadDocument,
    getBusinessDocuments,
    getDocumentById,
    updateEmbeddingStatus,
    deleteDocument
};
