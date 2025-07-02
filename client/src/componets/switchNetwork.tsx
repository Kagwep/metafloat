import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { lineaSepolia } from 'wagmi/chains';

export function ChainSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId(); // ✅ Replaces useNetwork
  const { switchChain, isPending } = useSwitchChain();



  const isWrongChain = isConnected && chainId !== lineaSepolia.id;

  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: lineaSepolia.id })}
        disabled={isPending}
        className="text-sm text-blue-500 hover:underline hover:cursor-pointer"
      >
        {isPending ? 'Switching...' : 'Switch to Linea Sepolia'}
      </button>
    );
  }

  return null;
}
