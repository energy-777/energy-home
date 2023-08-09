import { BlurImage } from '@/components/BlurImage'
import { Flex } from '@/components/base/Flex'
import { Stack } from '@/components/base/Stack'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useEnsAvatar, useEnsName } from 'wagmi'
import {
  useAuctionState,
  useCountdown,
  useCurrentAuctionQuery,
  useHistoricalTokenQuery,
  useManagerContext,
  useTokenExplorer,
} from '@public-assembly/builder-utils'
import { useRouter } from 'next/navigation'
import Label from '../base/Label'
import { CurrentAuctionSheet } from './CurrentAuctionSheet'
import { ExplorerButtons } from './ExplorerButtons'
import React from 'react'
import { shortenAddress } from '../../utils/shortenAddress'

const CurrentAuction = ({ tokenId }: { tokenId: number }) => {
  const { isMobile } = useIsMobile()
  const { tokenAddress } = useManagerContext()
  const { auctionState } = useAuctionState()
  const router = useRouter()

  const { isEnded } = useCountdown(auctionState.endTime)

  const {
    incrementId,
    decrementId,
    navigatedTokenId,
    isFirstToken,
    isLastToken,
  } = useTokenExplorer({ tokenId })

  function incrementAndPush() {
    incrementId()
    router.push(`/${Number(tokenId) + 1}`)
  }

  function decrementAndPush() {
    decrementId()
    router.push(`/${Number(tokenId) - 1}`)
  }

  const {
    startTime,
    endTime,
    extended,
    settled,
    winningBid,
    winningBidder,
    highestBid,
    highestBidder,
    bids,
  } = useCurrentAuctionQuery({
    tokenAddress: tokenAddress,
  })

  const { data: ensName } = useEnsName({
    address: winningBidder,
    chainId: 1,
  })

  const winningBidderPretty = React.useMemo(
    () => (ensName ? ensName : shortenAddress(winningBidder)),
    [ensName, winningBidder]
  )


  const { tokenName, tokenImage, tokenOwner } = useHistoricalTokenQuery({
    tokenAddress: tokenAddress,
    tokenId: BigInt(tokenId),
  })


  const auctionProps = {
    isMobile,
    tokenAddress,
    auctionState,
    router,
    isEnded,
    isLastToken,
    navigatedTokenId,
    tokenName,
    tokenOwner,
    winningBid,
    winningBidder,
    endTime,
    bids,
  }


  return (
    <Stack className="min-h-screen justify-center gap-4 px-4">
      <Flex className="relative w-full justify-center">
        <Stack className="relative aspect-square h-full max-h-[600px] w-full max-w-[600px] justify-between p-4">
          <div className="absolute inset-0 z-0 aspect-square w-full">
            {tokenImage && (
              <BlurImage
                src={tokenImage}
                height={600}
                width={600}
                alt={`${tokenId}`}
              />
            )}
          </div>

          <ExplorerButtons
            incrementId={incrementAndPush}
            decrementId={decrementAndPush}
            isFirstToken={isFirstToken}
            isLastToken={isLastToken}
          />

          {isMobile ? null : (
            <Flex className="justify-between">
              <Label variant="row" className="z-10">
                {tokenName}
              </Label>
              {!isEnded ? (
                <Label variant="row" className="z-10">
                  {Number(highestBid) > 0
                    ? `Current bid ${highestBid} ETH`
                    : 'No bids'}
                </Label>
              ) : (
                <Flex className="z-10 gap-4">
                  {Number(winningBid) > 0 ? (
                    <>
                      <Label variant="row">{`${winningBid} ETH`}</Label>
                      <Label variant="row">{`${winningBidderPretty}`}</Label>
                    </>
                  ) : (
                    <Label variant="row" className="z-10">
                      No bids
                    </Label>
                  )}
                </Flex>
              )}
            </Flex>
          )}
        </Stack>

        <CurrentAuctionSheet {...auctionProps} />
      </Flex>

      {/* Mobile */}
      {isMobile ? (
        <Stack className="h-full w-full flex-grow justify-between">
          <Stack className="gap-4">
            <Label variant="row" className="z-10">
              {tokenName}
            </Label>
            {!isEnded ? (
              <Label variant="row" className="z-10">
                {Number(highestBid) > 0
                  ? `Current bid ${highestBid} ETH`
                  : 'No bids'}
              </Label>
            ) : (
              <Flex className="z-10 gap-4">
                {Number(winningBid) > 0 ? (
                  <>
                    <Label variant="row">{`${winningBid} ETH`}</Label>
                    <Label variant="row">{`${winningBidderPretty}`}</Label>
                  </>
                ) : (
                  <Label variant="row" className="z-10">
                    No bids
                  </Label>
                )}
              </Flex>
            )}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default CurrentAuction
