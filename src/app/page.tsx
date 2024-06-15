"use client"
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { FaChevronRight } from "react-icons/fa6";
import BlurIn from '@/components/blue-in'


export default function Home() {
  return (
      <>
          <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
              <div
                  className={cn(
                      "group relative mx-auto flex mb-4 max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40"
                  )}
              >
                  <div
                      className={`absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`}
                  />
                  🎉 <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
                  <span
                      className={cn(
                          `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                      )}
                  >
                      Introducing Plux
                  </span>
                  <FaChevronRight className="ml-1 text-xs transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </div>
              <BlurIn className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
                  Chat with your <span className="text-blue-600">documents</span> in seconds.
              </BlurIn>
              <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
                  Plux allows you to have conversations with any PDF document. Simply upload your
                  file and start asking questions right away.
              </p>

              <Link
                  className={buttonVariants({
                      size: "lg",
                      className: "mt-5",
                  })}
                  href="/dashboard"
                  target="_blank"
              >
                  Get started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
          </MaxWidthWrapper>

          {/* value proposition section */}
          <div>
              <div className="relative isolate">
                  <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                  >
                      <div
                          style={{
                              clipPath:
                                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                          }}
                          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                      />
                  </div>

                  <div>
                      <div className="mx-auto max-w-6xl px-6 lg:px-8">
                          <div className="mt-16 flow-root sm:mt-24">
                              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                  <Image
                                      src="https://ik.imagekit.io/omraval18/plux-1_r3Aa1Xe0p.png?updatedAt=1718450579758"
                                      alt="product preview"
                                      width={1364}
                                      height={866}
                                      quality={100}
                                      className="rounded-md bg-white p-2 sm:p-8 md:p-4 shadow-2xl ring-1 ring-gray-900/10"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                  >
                      <div
                          style={{
                              clipPath:
                                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                          }}
                          className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
                      />
                  </div>
              </div>
          </div>

          {/* Feature section */}
          <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
              <div className="mb-12 px-6 lg:px-8">
                  <div className="mx-auto max-w-2xl sm:text-center">
                      <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
                          Start chatting in minutes
                      </h2>
                      <p className="mt-4 text-lg text-gray-600">
                          Chatting to your PDF files has never been easier than with plux.
                      </p>
                  </div>
              </div>

              {/* steps */}
              <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
                  <li className="md:flex-1">
                      <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                          <span className="text-sm font-medium text-blue-600">Step 1</span>
                          <span className="text-xl font-semibold">Sign up for an account</span>
                          <span className="mt-2 text-zinc-700">
                              Either starting out with a free plan or choose our{" "}
                              <Link
                                  href="/pricing"
                                  className="text-blue-700 underline underline-offset-2"
                              >
                                  pro plan
                              </Link>
                              .
                          </span>
                      </div>
                  </li>
                  <li className="md:flex-1">
                      <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                          <span className="text-sm font-medium text-blue-600">Step 2</span>
                          <span className="text-xl font-semibold">Upload your PDF file</span>
                          <span className="mt-2 text-zinc-700">
                              We&apos;ll process your file and make it ready for you to chat with.
                          </span>
                      </div>
                  </li>
                  <li className="md:flex-1">
                      <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                          <span className="text-sm font-medium text-blue-600">Step 3</span>
                          <span className="text-xl font-semibold">Start asking questions</span>
                          <span className="mt-2 text-zinc-700">
                              It&apos;s that simple. Try out plux today - it really takes less than
                              a minute.
                          </span>
                      </div>
                  </li>
              </ol>

              <div className="mx-auto max-w-6xl px-6 lg:px-8">
                  <div className="mt-16 flow-root sm:mt-24">
                      <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                          <Image
                              src="https://ik.imagekit.io/omraval18/plux-uploading_2gULRarWe.png?updatedAt=1718451510778"
                              alt="uploading preview"
                              width={1419}
                              height={732}
                              quality={100}
                              className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </>
  );
}
