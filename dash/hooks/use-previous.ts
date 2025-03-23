import { useEffect, useRef } from "react";

export default function usePrevious<T>(value: T): T {
  const ref: any = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
