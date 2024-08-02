// import { useWatchGenericTxs } from 'src/components/InstantGenericTxModal';
// import TransactionWaitingIcon from 'src/components/TransactionWaitingIcon';

export default function SwapButton({}: { onSwapComplete: () => void }) {
  // const { handleClick, iconReqState, isLoading } = useWatchGenericTxs([]);

  // Track iconReqState
  // const iconReqStateRef = useRef(iconReqState);
  // useEffect(() => {
  //   if (iconReqStateRef.current == 'Pending' && iconReqState == 'Idle') {
  //     // Changing from 'Pending' to 'Idle' state indicates complete
  //     onSwapComplete();
  //   }

  //   iconReqStateRef.current = iconReqState;
  // }, [iconReqState, onSwapComplete]);

  return (
    <button
      data-testid="swap-tokens-btn"
      // onClick={handleClick}
      // disabled={isLoading}
      className="btn btn-primary w-100 btn-lg"
      type="submit"
    >
      <i className="os-icon os-icon-refresh-ccw"></i>
      <span>Swap Now</span>
      {/* <TransactionWaitingIcon iconReqState={iconReqState} /> */}
    </button>
  );
}
