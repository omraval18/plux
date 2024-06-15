'use client'

import { trpc } from '@/app/_trpc/client'
import UploadButton from './UploadButton'
import { FaFilePdf } from "react-icons/fa";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
  Calendar,
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
  User2,
  UserCircle2,
} from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from './ui/button'
import { useState } from 'react'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import PdfPreview from './PDFPreview';

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({subscriptionPlan}: PageProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<string | null>(null)

  const utils = trpc.useContext()

  const { data: files, isLoading } =
    trpc.getUserFiles.useQuery()

  const { mutate: deleteFile } =
    trpc.deleteFile.useMutation({
      onSuccess: () => {
        utils.getUserFiles.invalidate()
      },
      onMutate({ id }) {
        setCurrentlyDeletingFile(id)
      },
      onSettled() {
        setCurrentlyDeletingFile(null)
      },
    })

  return (
      <main className="mx-auto max-w-7xl md:p-10">
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
              <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>

              <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
          </div>

          {/* display all user files */}
          {files && files?.length !== 0 ? (
              <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
                  {files
                      .sort(
                          (a, b) =>
                              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )
                      .map((file) => (
                          <li key={file.id} className="col-span-1">
                              <Card className="bg-secondary">
                                  <CardHeader>
                                      <Link
                                          href={`/dashboard/${file.id}`}
                                          className="flex w-full items-center justify-start space-x-4"
                                      >
                                          <FaFilePdf className="text-lg text-red-600" />
                                          <CardTitle className="truncate text-lg font-medium text-zinc-900">
                                              {file.name}
                                          </CardTitle>
                                      </Link>
                                  </CardHeader>
                                  <Link
                                      href={`/dashboard/${file.id}`}
                                  >
                                      <CardContent>
                                          <div className="max-w-8">
                                              <PdfPreview fileUrl={file.url} />
                                          </div>
                                      </CardContent>
                                  </Link>

                                  <CardFooter className="py-2">
                                      <div className="flex items-center justify-between w-full p-0 text-xs text-zinc-500">
                                          <div className="flex items-center justify-start gap-2">
                                              <User2 className="h-4 w-4 text-primary " />
                                              <p className="flex items-center gap-2">
                                                  You Created on{" "}
                                                  <strong className="text-base">•</strong>
                                              </p>
                                              {format(new Date(file.createdAt), "MMM yyyy")}
                                          </div>
                                          <Button
                                              onClick={() => deleteFile({ id: file.id })}
                                              size="sm"
                                              className="rounded-md"
                                              variant="destructive"
                                          >
                                              {currentlyDeletingFile === file.id ? (
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                  <div className="flex items-center gap-1">
                                                      <Trash className="h-3 w-3" />
                                                      Delete
                                                  </div>
                                              )}
                                          </Button>
                                      </div>
                                  </CardFooter>
                              </Card>
                          </li>
                      ))}
              </ul>
          ) : isLoading ? (
              <Skeleton height={100} className="my-2" count={3} />
          ) : (
              <div className="mt-16 flex flex-col items-center gap-2">
                  <Ghost className="h-8 w-8 text-zinc-800" />
                  <h3 className="font-semibold text-xl">Pretty empty around here</h3>
                  <p>Let&apos;s upload your first PDF.</p>
              </div>
          )}
      </main>
  );
}

export default Dashboard
