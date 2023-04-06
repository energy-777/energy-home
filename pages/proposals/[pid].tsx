import { useEffect, useState } from "react"

import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "@/hooks/useAuth"
import { useProposals } from "@/hooks/useProposals"
import Balancer from "react-wrap-balancer"

import { ArrowLeft, Check, Exit, Minus } from "@/components/assets/icons"
import { Divider } from "@/components/base/Divider"
import { Flex } from "@/components/base/Flex"
import Label from "@/components/base/Label"
import { RichText } from "@/components/base/Richtext"
import { Stack } from "@/components/base/Stack"
import { Body } from "@/components/base/Typography"
import { ProposalTimestamp } from "@/components/proposals/ProposalCard"
import {
  DecodedTransactions,
  VotesSection,
} from "@/components/proposals/ProposalDescription"
import ProposalLabel from "@/components/proposals/ProposalLabel"
import ProposalVoteButton from "@/components/proposals/ProposalVoteButton"
import { Proposer } from "@/components/proposals/Proposer"
import { BodyLarge, Headline } from "../../components/base/Typography"
import { NOUNS_PROPOSAL_SUPPORT, PROPOSAL_SUPPORT } from "../../types/index"
import { buildEtherscanLink } from "../../utils/helpers"
import { Hash } from "../../types/index"
import { useProposalPermissions } from "@/hooks/useProposalPermissions"
import { useGovernorContext } from "@public-assembly/dao-utils"
import { useContractRead } from "wagmi"
import { governorAbi } from "@public-assembly/dao-utils"
import { BigNumber } from "ethers"

function ProposalDetailPage() {
  const { allProposals } = useProposals()
  const { pid } = useRouter().query

  if (!allProposals) return null

  const proposal = allProposals.find((proposal) => proposal.proposalId === pid)

  const { canVote } = useProposalPermissions(proposal)

  if (!proposal) return null
  return (
    <Stack className="w-full px-4 md:px-10">
      <Stack className="w-full gap-10 pt-10">
        <ProposalNavigation />
        <Flex className="justify-between w-full h-full">
          {/* Header section */}
          <Stack className="w-full gap-4">
            <Flex className="items-center gap-6">
              <ProposalLabel>{proposal.status}</ProposalLabel>
              <ProposalTimestamp proposal={proposal} size="sm" />
            </Flex>
            <Stack className="w-full gap-2">
              <Balancer>
                <Headline>{proposal.title}</Headline>
              </Balancer>
              <p>
                By <Proposer proposer={proposal.proposer as Hash} />
              </p>
            </Stack>

            <div className="pt-2">
              <ProposalVoteStatus proposal={proposal} />
            </div>

            {/* Mobile Proposal Votes section */}
            <VotesSection
              className="md:hidden"
              forVotes={proposal.forVotes}
              abstainVotes={proposal.abstainVotes}
              againstVotes={proposal.againstVotes}
              votingThreshold={proposal.quorumVotes}
              // @ts-ignore - TODO: Update dao-utils gql.ts
              transactionHash={proposal.transactionInfo.transactionHash}
            />
          </Stack>

          {/* Desktop Proposal Votes section */}
          <VotesSection
            className="hidden md:flex"
            forVotes={proposal.forVotes}
            abstainVotes={proposal.abstainVotes}
            againstVotes={proposal.againstVotes}
            votingThreshold={proposal.quorumVotes}
            // @ts-ignore - TODO: Update dao-utils gql.ts
            transactionHash={proposal.transactionInfo.transactionHash}
          />
        </Flex>
      </Stack>
      <Divider />

      {/* Proposal description */}
      <RichText html={proposal.description} className="w-full" />

      {/* Proposer */}
      <section id="Proposer">
        <BodyLarge className="py-10">Proposer</BodyLarge>
        <Flex className="items-center">
          <Proposer
            proposer={proposal.proposer as Hash}
            className="text-primary"
          />
        </Flex>
      </section>

      {/* Proposal transactions */}
      <section id="Proposal Transactions">
        <BodyLarge className="py-10">Proposed Transactions</BodyLarge>
        <DecodedTransactions
          calldatas={proposal.calldatas}
          targets={proposal.targets}
          values={proposal.values}
        />
      </section>
    </Stack>
  )
}

export default ProposalDetailPage

function ProposalNavigation() {
  return (
    <Link href="/proposals" className="cursor-pointer group">
      <Flex className="gap-2 w-fit">
        <ArrowLeft className="transition duration-200 ease-in-out group-hover:-translate-x-1" />
        <Body>Back to proposals</Body>
      </Flex>
    </Link>
  )
}

function ProposalVoteStatus({ proposal }) {
  /**
   * Address of the connected user
   */
  const { address, isConnected } = useAuth()
  /**
   * If the current proposal needs action from the connected user
   */
  const [needsAction, setNeedsAction] = useState<boolean>(false)
  /**
   * If the connected user can vote on the current proposal
   */
  const [canVote, setCanVote] = useState<boolean>(false)
  /**
   * If the connected user has voted, how they voted
   */
  const [voteSupport, setVoteSupport] = useState<PROPOSAL_SUPPORT | null>(null)
  /**
   * The transaction hash of the connected user's voting instance
   */
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const { governorAddress } = useGovernorContext()

  useContractRead({
    address: governorAddress,
    abi: governorAbi,
    functionName: "getVotes",
    args: [address as Hash, BigNumber.from(proposal.timeCreated)],
    onSuccess(availableVotes) {
      if (availableVotes.toNumber() > 0) {
        setCanVote(true)
      }
    },
  })

  useEffect(() => {
    // Exit the useEffect hook on the first render if address is not defined
    if (!address) return
    // Return all voting instances for this proposal
    const proposalVotes = proposal.votes
    // Return votes conducted by the connected address
    // prettier-ignore
    const vote = proposalVotes.find((vote: any) => vote.voter === address.toLowerCase())
    // Get the hash of the voting instance
    const hash = vote?.transactionInfo?.transactionHash
    // If there is a hash, set it to the txHash state variable
    if (hash) setTxHash(hash)
    // Check if the connected address has voted on this proposal.
    // prettier-ignore
    const hasVoted = proposalVotes.some((vote: any) => vote.voter === address.toLowerCase())
    // If the connected address has voted, set their support to the voteSupport state variable
    if (hasVoted) setVoteSupport(vote.support)
    // Set the needsAction boolean to true if they haven't voted and false if not
    setNeedsAction(!hasVoted)
  }, [address, proposal.votes, voteSupport])

  if (!isConnected) return null
  if (isConnected && !canVote)
    return <Label>You are not eligible to vote</Label>
  return (
    <>
      {needsAction ? <ProposalVoteButton proposal={proposal} /> : null}

      {(() => {
        switch (voteSupport) {
          case NOUNS_PROPOSAL_SUPPORT.ABSTAIN:
            return (
              <Label
                showIcon
                iconLeft={<Exit />}
                showExternalLinkIcon
                externalLink={buildEtherscanLink("tx", txHash)}
              >
                You abstained from voting
              </Label>
            )
          case NOUNS_PROPOSAL_SUPPORT.FOR:
            return (
              <>
                <Label
                  showIcon
                  iconLeft={<Check className="cursor-pointer" />}
                  showExternalLinkIcon
                  externalLink={buildEtherscanLink("tx", txHash)}
                >
                  You voted for this proposal
                </Label>
              </>
            )

          case NOUNS_PROPOSAL_SUPPORT.AGAINST:
            return (
              <Label
                showIcon
                iconLeft={<Minus />}
                showExternalLinkIcon
                externalLink={buildEtherscanLink("tx", txHash)}
              >
                You voted against this proposal
              </Label>
            )
          default:
            return null
        }
      })()}
    </>
  )
}
