import { useEffect, useState } from "react";

/**
 * Hook to manage state with delayed commit.
 */
export default function useStaging(initialValue, delay = 200) {
  const [value, setValue] = useState(initialValue);
  const [staging, setStaging] = useState(initialValue);
  const [handle, setHandle] = useState(null);

  useEffect(() => {
    if (handle != null) {
      clearTimeout(handle);
    }
    setHandle(setTimeout(() => setValue(staging), delay));
  }, [staging]);

  return { value, staging, setStaging, setValue };
}
