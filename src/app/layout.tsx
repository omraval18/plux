import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import { cn, constructMetadata } from '@/lib/utils'
import { Bricolage_Grotesque,Linden_Hill,Maitree } from 'next/font/google'

import './globals.css'

import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css'

import {Toaster} from "sonner"

const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--bricolage",
    display: "swap", 
    adjustFontFallback: false,
    fallback: ["system-ui", "arial"],
});
const linden = Linden_Hill({ weight:"400",subsets: ['latin'],display: 'swap',variable: '--linden' })
const maitree = Maitree({ subsets: ['latin'],display: 'swap',variable: '--maitree', weight:["400","500","600","700"] })
export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='light'>
      <Providers>
        <body
          className={cn(
            'min-h-screen antialiased bg-background bricolage',
            bricolage.variable,
            linden.variable,
            maitree.variable
          )}>
          <Toaster richColors/>
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  )
}
