import React, { useEffect, useState } from "react";

type SetStateAction<T = any> = React.Dispatch<React.SetStateAction<T>>;

export type StagingShape<T = any> = {
  value: T;
  staging: T;
  setStaging: SetStateAction<T>;
  setValue: SetStateAction<T>;
};

/**
 * Hook to manage state with delayed commit.
 */
export default function useStaging<T = any>(
  initialValue: T,
  delay = 200
): StagingShape {
  const [value, setValue] = useState(initialValue);
  const [staging, setStaging] = useState(initialValue);
  const [handle, setHandle] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (handle != null) {
      clearTimeout(handle);
    }
    const newHandle = setTimeout(() => setValue(staging), delay);
    setHandle(newHandle);
    return () => clearTimeout(newHandle);
  }, [staging]);

  return { value, staging, setStaging, setValue };
}
