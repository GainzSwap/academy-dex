import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { useBlock } from "wagmi";
import { formatTime } from "~~/utils/dateTime";

export const useComputeTimeleft = ({ deadline }: { deadline: bigint }) => {
  const { data: block } = useBlock({ watch: true });
  const [blockSecsLeft, setBlockSecsLeft] = useState(0);

  const decreaseSecs = useRef(
    debounce(() => {
      setBlockSecsLeft(secs => secs - 1);
    }, 1000),
  );

  useEffect(() => {
    // Run decrease until after 5 secs expired
    blockSecsLeft > -5 && decreaseSecs.current();
  }, [blockSecsLeft]);

  useEffect(() => {
    if (block) {
      setBlockSecsLeft(+(deadline - block.timestamp).toString());
    }
  }, [block?.timestamp]);

  return {
    block,
    blockSecsLeft,
    timeLeft: blockSecsLeft > 0 ? formatTime(blockSecsLeft) : "0s",
  };
};
