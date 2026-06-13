/**
 * useConverter
 *
 * Manages conversion state: loading, result, errors.
 * Decouples the API call from UI components.
 */

import { useState, useCallback } from "react";
import { Flowchart, GenerationResult } from "../types";
import { convertFlowchart } from "../services/api";

interface UseConverterReturn {
  result:   GenerationResult | null;
  errors:   string[];
  loading:  boolean;
  convert:  (flowchart: Flowchart) => Promise<void>;
  reset:    () => void;
}

export function useConverter(): UseConverterReturn {
  const [result,  setResult]  = useState<GenerationResult | null>(null);
  const [errors,  setErrors]  = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const convert = useCallback(async (flowchart: Flowchart) => {
    setLoading(true);
    setErrors([]);
    setResult(null);

    try {
      const response = await convertFlowchart(flowchart);
      if (response.success && response.result) {
        setResult(response.result);
      } else {
        setErrors(response.errors ?? ["Unknown error."]);
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Network error."]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setErrors([]);
  }, []);

  return { result, errors, loading, convert, reset };
}
