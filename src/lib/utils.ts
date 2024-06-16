import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.LIVE_URL)
    return `https://${process.env.LIVE_URL}${path}`
  return `http://localhost:${
    process.env.PORT ?? 3000
  }${path}`
}

export function constructMetadata({
    title = "Plux - giving superpower to your PDFs",
    description = "Plux is an open-source software to make chatting to your PDF files easy.",
    image = "/thumbnail.png",
    icons = "https://ik.imagekit.io/omraval18/logoipsum-296%201_6UQOprClIu.png?updatedAt=1718484290691",
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    icons?: string;
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@omraval18",
        },
        icons,
        metadataBase: new URL("https://plux.onrender.com"),
        themeColor: "#FFF",
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}