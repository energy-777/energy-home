import React, { useEffect } from "react"

import { useProposals } from "@/hooks/useProposals"
import { motion } from "framer-motion"
import { isServerSide } from "utils/helpers"

import { Seo } from "@/components/Seo"
import { Divider } from "@/components/base/Divider"
import { Flex } from "@/components/base/Flex"
import { Stack } from "@/components/base/Stack"
import { Caption } from "@/components/base/Typography"
import { ActiveProposalList } from "@/components/proposals/ActiveProposalList"
import { NotActiveProposalList } from "@/components/proposals/NotActiveProposalList"
import ProposalEmptyState from "@/components/proposals/ProposalEmptyState"

function ProposalsPage() {
  const {
    totalProposalCount,
    activeProposals,
    proposals,
    activeProposalCount,
    isEmpty,
    hasActiveProposals,
    hasProposals,
  } = useProposals()

  const [loading, setLoading] = React.useState(false)
  useEffect(() => {
    setLoading(true)
  }, [])

  if (isServerSide()) return null
  if (!loading) return null

  return (
    <motion.section className="flex flex-col items-center justify-center min-h-full gap-8 px-4 m-auto max-w-7xl grow">
      <Seo title="proposals" />
      <Flex className="justify-start hidden w-full gap-10 md:flex">
        <Caption>{activeProposalCount} Active</Caption>
        <Caption>{totalProposalCount} Total</Caption>
      </Flex>

      <Stack className="items-center justify-center w-full h-full">
        {isEmpty ? <ProposalEmptyState /> : null}

        {hasActiveProposals ? (
          <>
            <ActiveProposalList proposals={activeProposals} />
            <Divider />
          </>
        ) : null}

        {hasProposals && <NotActiveProposalList proposals={proposals} />}
      </Stack>
    </motion.section>
  )
}

export default ProposalsPage
