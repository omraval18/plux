import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { useToast } from "./ui/use-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfPreviewProps {
    fileUrl: string;
}

const PdfPreview = ({ fileUrl }: PdfPreviewProps) => {
    const [numPages, setNumPages] = useState<number | undefined>(undefined);
    const { toast } = useToast();

    return (
        <div className="aspect-video overflow-hidden w-full object-fill rounded-lg">
            <div className="relative w-full h-0 pb-[100%]">
                <div className="absolute inset-0">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        onLoadError={() => {
                            toast({
                                title: "Error loading PDF",
                                description: "Please try again later",
                                variant: "destructive",
                            });
                        }}
                    >
                        {numPages ? (
                            numPages > 0 && <Page pageNumber={1} renderMode="canvas" width={200} renderTextLayer={false} scale={1.5} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                            </div>
                        )}
                    </Document>
                </div>
            </div>
        </div>
    );
};

export default PdfPreview;
