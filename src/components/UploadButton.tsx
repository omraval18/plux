"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { TextureButton } from "./ui/texture-button";

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
    const router = useRouter();

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const { startUpload } = useUploadThing(isSubscribed ? "proPlanUploader" : "freePlanUploader");

    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`);
        },
        retry: true,
        retryDelay: 500,
    });

    const startSimulatedProgress = () => {
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 95) {
                    clearInterval(interval);
                    return prevProgress;
                }
                return prevProgress + 5;
            });
        }, 500);

        return interval;
    };

    function validateFile(file: File) {
        const regex = /\.pdf$/i;

        if (!regex.test(file.name)) {
            return {
                code: "invalid File Type Please upload a PDF",
                message: "Please upload a PDF!",
            };
        }
        return null;
    }

    return (
        <div className="">
            <Dropzone
                multiple={false}
                validator={validateFile}
                onDrop={async (acceptedFile) => {
                    if (uploadProgress > 0) {
                        return toast.info("Please wait for the upload to complete");
                    }

                    if (!(acceptedFile.length > 0)) {
                        return toast.error("Provide Valid PDF");
                    }

                    setIsUploading(true);
                    const progressInterval = startSimulatedProgress();
                    const res = await startUpload(acceptedFile);

                    if (!res) {
                        return toast.error("Something went wrong!");
                    }

                    const [fileResponse] = res;
                    const key = fileResponse?.key;

                    if (!key) {
                        return toast.error("Something went wrong!");
                    }

                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    startPolling({ key });
                    return toast.success("Upload successful!");
                }}
            >
                {({ getRootProps, getInputProps, acceptedFiles }) => (
                    <div
                        {...getRootProps()}
                        className="border h-64 m-4 border-dashed border-gray-300 rounded-lg cursor-pointer"
                    >
                        <div className="flex items-center justify-center h-full w-full">
                            <div className="flex flex-col items-center justify-center w-full h-full rounded-lg bg-gray-50 hover:bg-gray-100">
                                {!uploadProgress && (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                                        <p className="mb-2 text-sm text-zinc-700">
                                            <span className="font-semibold">Click to upload</span>{" "}
                                            or drag and drop
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            PDF (up to {isSubscribed ? "16" : "4"}MB)
                                        </p>
                                    </div>
                                )}

                                {acceptedFiles && acceptedFiles[0] ? (
                                    <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                        <div className="px-3 py-2 h-full grid place-items-center">
                                            <File className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div className="px-3 py-2 h-full text-sm truncate">
                                            {acceptedFiles[0].name}
                                        </div>
                                    </div>
                                ) : null}

                                {isUploading ? (
                                    <div className="w-full mt-4 max-w-xs mx-auto">
                                        <Progress
                                            indicatorColor={
                                                uploadProgress === 100 ? "bg-green-500" : ""
                                            }
                                            value={uploadProgress}
                                            className="h-1 w-full bg-zinc-200"
                                        />
                                        {uploadProgress === 100 ? (
                                            <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Redirecting...
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                {/* Hidden input - this is handled by Dropzone automatically */}
                                <input {...getInputProps()} />
                            </div>
                        </div>
                    </div>
                )}
            </Dropzone>
        </div>
    );
};

const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v) {
                    setIsOpen(v);
                }
            }}
        >
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <div>
                    <TextureButton variant="accent">Upload PDF</TextureButton>
                </div>
            </DialogTrigger>

            <DialogContent>
                <UploadDropzone isSubscribed={isSubscribed} />
            </DialogContent>
        </Dialog>
    );
};

export default UploadButton;
