import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

const middleware = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser(); // Make sure to await this

    if (!user || !user.id) throw new Error("Unauthorized");

    const subscriptionPlan = await getUserSubscriptionPlan();

    return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
    metadata,
    file,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>;
    file: {
        key: string;
        name: string;
        url: string;
    };
}) => {
    // console.log("onUploadComplete started for file:", file.key);

    const isFileExist = await db.file.findFirst({
        where: {
            key: file.key,
        },
    });

    if (isFileExist) {
        console.log("File already exists:", file.key);
        return;
    }

    const createdFile = await db.file.create({
        data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url, // Use file.url directly from UploadThing
            uploadStatus: "PROCESSING",
        },
    });

    // console.log("Created file record:", createdFile.id);

    try {
        // Use file.url directly instead of constructing URL
        const response = await fetch(file.url);

        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        // console.log("Fetched blob, size:", blob.size);

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;

        // console.log("PDF loaded, pages:", pagesAmt);

        const { subscriptionPlan } = metadata;
        const { isSubscribed } = subscriptionPlan;

        const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
        const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

        if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
            console.log("Page limit exceeded:", {
                pagesAmt,
                isSubscribed,
                isProExceeded,
                isFreeExceeded,
            });
            await db.file.update({
                data: {
                    uploadStatus: "FAILED",
                },
                where: {
                    id: createdFile.id,
                },
            });
            return; // Return early to avoid further processing
        }

        // console.log("Starting vectorization...");

        // vectorize and index entire document
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("plux");

        const embeddings = new TogetherAIEmbeddings({
            apiKey: process.env.TOGETHER_AI_API_KEY,
            model: "togethercomputer/m2-bert-80M-8k-retrieval",
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id,
        });

        // console.log("Vectorization complete, updating status to SUCCESS");

        await db.file.update({
            data: {
                uploadStatus: "SUCCESS",
            },
            where: {
                id: createdFile.id,
            },
        });

        // console.log("File processing completed successfully for:", file.key);

        // Return success data to client
        return {
            uploadedBy: metadata.userId,
            fileId: createdFile.id,
            status: "SUCCESS",
        };
    } catch (err) {
        console.error("Error processing file:", err);
        await db.file.update({
            data: {
                uploadStatus: "FAILED",
            },
            where: {
                id: createdFile.id,
            },
        });

        // Don't throw error here to avoid breaking the upload callback
        // UploadThing will mark as failed if we throw
        console.error("File processing failed, but upload was successful");
    }
};

export const ourFileRouter: FileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
};

export type OurFileRouter = typeof ourFileRouter;
