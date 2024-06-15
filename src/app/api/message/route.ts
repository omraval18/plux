import { db } from '@/db'
import { openai } from '@/lib/openai'
import { getPineconeClient } from '@/lib/pinecone'
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { PineconeStore } from '@langchain/pinecone'
import { NextRequest } from 'next/server'
import {  StreamingTextResponse } from 'ai'
import { createOpenAI } from "@ai-sdk/openai";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";


import { streamText } from "ai";
import { Embeddings } from 'openai/resources/embeddings.mjs';

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json()

  const { getUser } = getKindeServerSession()
  const user = getUser()

  const { id: userId } = user

  if (!userId)
    return new Response('Unauthorized', { status: 401 })

  const { fileId, message } =
    SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file)
    return new Response('Not found', { status: 404 })

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // 1: vectorize message


  const embeddings = new TogetherAIEmbeddings({
      apiKey: process.env.TOGETHER_AI_API_KEY, // Default value
      model: "togethercomputer/m2-bert-80M-8k-retrieval", // Default value
  });

  const pinecone = await getPineconeClient()
  const pineconeIndex = pinecone.Index('plux')

  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      namespace: file.id,
    }
  )

  const results = await vectorStore.similaritySearch(
    message,
    4
  )

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const),
    content: msg.text,
  }))

  const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
  });

  const model = groq("llama3-8b-8192");


  const response = await streamText({
    model: model,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === 'user')
      return `User: ${message.content}\n`
    return `Assistant: ${message.content}\n`
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${message}`,
      },
    ],
  })

  // const stream = OpenAIStream(response, {
  //   async onCompletion(completion) {
  //     await db.message.create({
  //       data: {
  //         text: completion,
  //         isUserMessage: false,
  //         fileId,
  //         userId,
  //       },
  //     })
  //   },
  // })

  return new StreamingTextResponse(
      response.toAIStream({
          async onFinal(completion:any) {
                  await db.message.create({
                    data: {
                      text: completion as string,
                      isUserMessage: false,
                      fileId,
                      userId,
                    },
                  })
          },
      })
  );
}