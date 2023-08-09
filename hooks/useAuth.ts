import {
  useAccount,
  useBalance,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from 'wagmi'
import { shortenAddress } from '../utils/shortenAddress'

export function useAuth() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { address, isConnecting, ...rest } = useAccount()
  // ENS related functionality hardcoded out until crosschain ens resolution implemented
  const { data: ensName } = useEnsName({
    address: address,
    chainId : 1
  })
  const { data: ensAvatar } = useEnsAvatar({
    name: address,
    chainId : 1
  })
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { data: balance } = useBalance({ address: address })

  return {
    publicClient,
    walletClient,
    address: address,
    ensName: ensName || shortenAddress(address),
    ensAvatar: ensAvatar,
    displayName: ensName || shortenAddress(address),
    balance: balance,
    loading: isConnecting,
    logout: disconnect,
    chain,
    ...rest,
  }
}
