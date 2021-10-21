import { useCallback, useEffect, useState } from "react";

export type UseLoadTriggerOptions = {
  loading: boolean;
  error?: boolean;
  onLoad: () => Promise<any>;
  hasMore: boolean;
};

export type UseLoadTriggerResults = {
  setVisible: (visible: boolean) => void;
};

export default function useLoadTrigger(
  options: UseLoadTriggerOptions
): UseLoadTriggerResults {
  const { loading, error, onLoad, hasMore } = options;

  const [progress, setProgress] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const handleLoad = useCallback(async () => {
    setProgress(true);
    try {
      await onLoad();
    } finally {
      setProgress(false);
    }
  }, [onLoad, loading, hasMore]);

  // Perform autoload.
  const shouldAutoload = visible && hasMore && !loading && !error && !progress;
  useEffect(() => {
    if (shouldAutoload) {
      handleLoad().catch(console.error);
    }
  }, [shouldAutoload]);

  return { setVisible };
}
