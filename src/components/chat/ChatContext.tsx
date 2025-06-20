import {
  ReactNode,
  createContext,
  useRef,
  useState,
} from 'react'
import { useToast } from '../ui/use-toast'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void
  isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
})

interface Props {
  fileId: string
  children: ReactNode
}

export const ChatContextProvider = ({
  fileId,
  children,
}: Props) => {
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const utils = trpc.useContext()

  const { toast } = useToast()

  const backupMessage = useRef('')

  const { mutate: sendMessage } = useMutation({
      mutationFn: async ({ message }: { message: string }) => {
          const response = await fetch("/api/message", {
              method: "POST",
              body: JSON.stringify({
                  fileId,
                  message,
              }),
          });

          if (!response.ok) {
              throw new Error("Failed to send message");
          }

          return response.body;
      },
      onMutate: async ({ message }) => {
          backupMessage.current = message;
          setMessage("");

          // step 1
          await utils.getFileMessages.cancel();

          // step 2
          const previousMessages = utils.getFileMessages.getInfiniteData();

          // step 3
          utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
              if (!old) {
                  return {
                      pages: [],
                      pageParams: [],
                  };
              }

              let newPages = [...old.pages];

              let latestPage = newPages[0]!;

              latestPage.messages = [
                  {
                      createdAt: new Date().toISOString(),
                      id: crypto.randomUUID(),
                      text: message,
                      isUserMessage: true,
                  },
                  ...latestPage.messages,
              ];

              newPages[0] = latestPage;

              return {
                  ...old,
                  pages: newPages,
              };
          });

          setIsLoading(true);

          return {
              previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? [],
          };
      },
      // Updated onSuccess handler in your ChatContext
      onSuccess: async (stream) => {
          setIsLoading(false);

          if (!stream) {
              return toast({
                  title: "There was a problem sending this message",
                  description: "Please refresh this page and try again",
                  variant: "destructive",
              });
          }

          const reader = stream.getReader();
          const decoder = new TextDecoder("utf-8");
          let done = false;
          let accResponse = "";

          while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              const chunkValue = decoder.decode(value, { stream: true });

              // Parse the streaming format
              const lines = chunkValue.split("\n").filter((line) => line.trim());

              for (const line of lines) {
                  try {
                      // Handle different chunk types
                      if (line.startsWith('0:"')) {
                          // Extract text content from 0:"text" format
                          const textMatch = line.match(/^0:"(.+)"$/);
                          if (textMatch) {
                              const text = textMatch[1]
                                  .replace(/\\n/g, "\n") // Handle escaped newlines
                                  .replace(/\\"/g, '"') // Handle escaped quotes
                                  .replace(/\\\\/g, "\\"); // Handle escaped backslashes

                              accResponse += text;
                          }
                      } else if (line.startsWith("f:")) {
                          // Initial message metadata - you can extract messageId if needed
                          const metadataMatch = line.match(/^f:(.+)$/);
                          if (metadataMatch) {
                              console.log("Message metadata:", JSON.parse(metadataMatch[1]));
                          }
                      } else if (line.startsWith("e:") || line.startsWith("d:")) {
                          // End/finish information - stream is complete
                          const finishMatch = line.match(/^[ed]:(.+)$/);
                          if (finishMatch) {
                              console.log("Stream finished:", JSON.parse(finishMatch[1]));
                          }
                      }
                  } catch (error) {
                      console.warn("Failed to parse chunk:", line, error);
                      // If parsing fails, just append the raw text (fallback)
                      if (line.includes('"')) {
                          const quotedText = line.match(/"([^"]*)"/g);
                          if (quotedText) {
                              accResponse += quotedText.map((q) => q.slice(1, -1)).join("");
                          }
                      }
                  }
              }

              // Update the UI with accumulated response
              utils.getFileMessages.setInfiniteData(
                  { fileId, limit: INFINITE_QUERY_LIMIT },
                  (old) => {
                      if (!old) return { pages: [], pageParams: [] };

                      let isAiResponseCreated = old.pages.some((page) =>
                          page.messages.some((message) => message.id === "ai-response")
                      );

                      let updatedPages = old.pages.map((page) => {
                          if (page === old.pages[0]) {
                              let updatedMessages;

                              if (!isAiResponseCreated) {
                                  updatedMessages = [
                                      {
                                          createdAt: new Date().toISOString(),
                                          id: "ai-response",
                                          text: accResponse,
                                          isUserMessage: false,
                                      },
                                      ...page.messages,
                                  ];
                              } else {
                                  updatedMessages = page.messages.map((message) => {
                                      if (message.id === "ai-response") {
                                          return {
                                              ...message,
                                              text: accResponse,
                                          };
                                      }
                                      return message;
                                  });
                              }

                              return {
                                  ...page,
                                  messages: updatedMessages,
                              };
                          }

                          return page;
                      });

                      return { ...old, pages: updatedPages };
                  }
              );
          }
      },

      onError: (_, __, context) => {
          setMessage(backupMessage.current);
          utils.getFileMessages.setData({ fileId }, { messages: context?.previousMessages ?? [] });
      },
      onSettled: async () => {
          setIsLoading(false);

          await utils.getFileMessages.invalidate({ fileId });
      },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value)
  }

  const addMessage = () => sendMessage({ message })

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}>
      {children}
    </ChatContext.Provider>
  )
}
