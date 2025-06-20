import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { CoreMessage, streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { Message } from "@prisma/client";

export const POST = async (req: NextRequest) => {
    try {
        // console.log("Chat API called");

        const body = await req.json();
        // console.log("Request body:", body);

        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            console.log("User not authenticated");
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = user.id;
        // console.log("User ID:", userId);

        const { fileId, message } = SendMessageValidator.parse(body);
        // console.log("Parsed request - fileId:", fileId, "message:", message);

        // Check if file exists and belongs to user
        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId: userId,
            },
        });

        if (!file) {
            console.log("File not found or doesn't belong to user");
            return new Response("File not found", { status: 404 });
        }

        // console.log("File found:", file.name, "Upload status:", file.uploadStatus);

        // Check if file processing is complete
        if (file.uploadStatus !== "SUCCESS") {
            console.log("File not ready for chat, status:", file.uploadStatus);
            return new Response("File is still processing. Please wait.", { status: 400 });
        }

        // Save user message to database
        // console.log("Saving user message to database...");
        const userMessage = await db.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId: userId,
                fileId: fileId,
            },
        });
        // console.log("User message saved with ID:", userMessage.id);

        // Check environment variables
        if (!process.env.TOGETHER_AI_API_KEY) {
            throw new Error("TOGETHER_AI_API_KEY not configured");
        }
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY not configured");
        }

        // 1: vectorize message and search for relevant content
        // console.log("Creating embeddings...");
        const embeddings = new TogetherAIEmbeddings({
            apiKey: process.env.TOGETHER_AI_API_KEY,
            model: "togethercomputer/m2-bert-80M-32k-retrieval",
        });

        // console.log("Connecting to Pinecone...");
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("plux");

        // console.log("Creating vector store...");
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id,
        });

        // console.log("Searching for similar content...");
        const results = await vectorStore.similaritySearch(message, 4);
        // console.log("Found", results.length, "relevant chunks");

        // Get previous messages for context
        // console.log("Fetching previous messages...");
        const prevMessages: Message[] = await db.message.findMany({
            where: {
                fileId: fileId,
            },
            orderBy: {
                createdAt: "asc",
            },
            take: 6,
        });
        // console.log("Found", prevMessages.length, "previous messages");

        const formattedPrevMessages = prevMessages.map((msg) => ({
            role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
            content: msg.text,
        }));

        // Setup Groq
        // console.log("Setting up Groq client...");
        const groq = createGroq({
            baseURL: "https://api.groq.com/openai/v1",
            apiKey: process.env.GROQ_API_KEY,
        });

        const model = groq("llama3-8b-8192");

        // Prepare context from search results
        const context = results.map((r) => r.pageContent).join("\n\n");
        // console.log("Context length:", context.length, "characters");

        // Create the messages array
        const messages: CoreMessage[] = [
            {
                role: "system",
                content: `You are a helpful AI assistant that answers questions about documents. Use the provided context to answer questions accurately. If you don't know the answer based on the context, say so clearly.`,
            },
        ];

        // Add previous conversation for context (last 4 messages)
        const recentMessages = formattedPrevMessages.slice(-4);
        messages.push(...recentMessages);

        // Add the current question with context
        messages.push({
            role: "user",
            content: `Based on the following document content, please answer my question:

DOCUMENT CONTEXT:
${context}

QUESTION: ${message}

Please provide a detailed answer in markdown format. If the answer cannot be found in the provided context, please say so clearly.`,
        });

        console.log("Sending", messages.length, "messages to Groq");

        // Stream the response
        console.log("Starting to stream response...");
        const response = await streamText({
            model,
            temperature: 0.1,
            maxTokens: 1000,
            messages,
            onFinish: async ({ text, finishReason }) => {
                console.log("Stream finished, reason:", finishReason);
                console.log("Response length:", text.length, "characters");

                try {
                    const aiMessage = await db.message.create({
                        data: {
                            text: text,
                            isUserMessage: false,
                            fileId: fileId,
                            userId: userId,
                        },
                    });
                    console.log("AI response saved to database with ID:", aiMessage.id);
                } catch (error) {
                    console.error("Error saving AI response to database:", error);
                }
            },
        });

        // console.log("Returning streaming response...");
        return response.toDataStreamResponse();
    } catch (error) {
        console.error("Error in chat API:", error);
        return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
};
