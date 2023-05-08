import { Flex } from '@/components/base/Flex'
import {
  Headline,
  Body,
  BodySmall,
  Caption,
} from '@/components/base/Typography'
import { useAuth } from '@/hooks/useAuth'
import { Exit } from '@/components/assets/icons'
import { Stack } from '@/components/base/Stack'
import { ArrowUpRight } from '@/components/assets/icons'
import { CheckCircle } from '@/components/assets/icons'
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useContractEvent,
} from 'wagmi'
import { platformThemeRegistryAbi } from 'abi/platformThemeRegistryAbi'
import { Hash } from 'types'
import { Pending } from '@/components/assets/icons'
import { useState } from 'react'
import AltConnectButton from '@/components/AltConnectButton'
import useCopyText from '@/hooks/useCopyText'
import { Copy } from '@/components/assets/icons'
import { Separator } from '@/components/base/Separator'
import { useRouter } from 'next/router'

const themeRegistry = '0x9a23AE640040e4d34E9e00E500003000017144F4'

export default function Platform() {
  const router = useRouter()

  const { address, isConnected } = useAuth()

  const { handleCopy, hasCopied } = useCopyText()

  const { config } = usePrepareContractWrite({
    address: themeRegistry,
    abi: platformThemeRegistryAbi,
    functionName: 'newPlatformIndex',
    args: [address as Hash, ''],
  })

  const { data, write: newIndex } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const [platformIndex, setPlatformIndex] = useState<number>()

  useContractEvent({
    address: themeRegistry,
    abi: platformThemeRegistryAbi,
    eventName: 'PlatformThemeUpdated',
    listener(platformIndex, sender, newTheme) {
      setPlatformIndex(Number(platformIndex))
      console.log(
        'platformIndex, sender, newTheme:',
        platformIndex,
        sender,
        newTheme
      )
    },
    // Receive only a single event, then stop listener
    once: true,
  })

  return (
    <Stack className="fixed top-0 left-0 z-50 h-full w-full bg-[#111111] p-6">
      <Flex className="mx-auto my-auto w-auto flex-col rounded-lg border border-[#333333] bg-black p-8 sm:w-[478px]">
        <div>
          <Flex className="items-start gap-x-8">
            <p className="font-satoshi text-[1.5rem] font-medium leading-10 tracking-[-0.5px] text-white">
              Ready to create your own DAO interface?
            </p>
            <button onClick={() => router.push('/')}>
              <Exit className="h-8 w-8 text-white hover:cursor-pointer sm:mt-1" />
            </button>
          </Flex>
          <Separator className="mt-8 mb-6 bg-[#333333]"></Separator>
          {!isConnected ? (
            <>
              <p className="font-satoshi text-base text-[#999999]">
                Please connect your wallet.
              </p>
              <AltConnectButton />
            </>
          ) : (
            <>
              <p className="mb-2 flex gap-4 font-mono text-base uppercase text-[#3291FF]">
                1. Create a platform index {!isSuccess ? null : <CheckCircle />}
              </p>
              <p className="font-satoshi text-base text-[#999999]">
                This will allow the person submitting the transaction to change
                the site&apos;s theme and grant others similar access.
              </p>

              {!isSuccess ? (
                <button
                  className="mt-6 flex min-w-[156px] justify-center rounded border border-[#333333] bg-white py-3 px-8 font-satoshi font-medium hover:bg-opacity-80"
                  onClick={() => newIndex?.()}
                >
                  {!isLoading ? (
                    'Create Index'
                  ) : (
                    <Pending className="animate-spin" />
                  )}
                </button>
              ) : null}
            </>
          )}
        </div>

        {isSuccess ? (
          <div>
            <Separator className="mt-8 mb-6 bg-[#333333]"></Separator>
            <p className="mb-2 flex gap-4 font-mono text-base uppercase text-[#3291FF]">
              2. Save your index variable {!hasCopied ? null : <CheckCircle />}
            </p>
            <p className="font-satoshi text-base text-[#999999]">
              <span className="font-medium text-white">Important!&nbsp;</span>
              Make sure to remember this number. During the deploy stage,
              you&apos;ll provide this value when prompted for your
              NEXT_PUBLIC_PLATFORM_INDEX.
            </p>
            <div className="flex justify-center text-center">
              <button
                className="flex items-center"
                onClick={() =>
                  platformIndex && handleCopy(platformIndex.toString())
                }
              >
                <p className="my-8 font-satoshi text-[1.5rem] font-bold leading-10 tracking-[-0.5px] text-white">
                  {platformIndex}
                </p>
                <Copy className="mt-.5 ml-2 transform text-white hover:cursor-pointer active:scale-125" />
              </button>
            </div>
            <button className="mx-auto flex w-full items-center justify-center bg-white py-3 hover:bg-opacity-80">
              <a
                href="https://flexible-docs-peach.vercel.app/docs/deploy_walkthrough"
                target="_blank"
                rel="noreferrer"
                className="mr-1 font-satoshi font-medium"
              >
                Continue to walkthrough
              </a>
              <ArrowUpRight className="text-[#121213]" />
            </button>
          </div>
        ) : null}
      </Flex>
    </Stack>
  )
}
