/**
 * ConversionService
 *
 * Orchestrates the full pipeline:
 *   Flowchart → Validate → IR → Generate (pseudocode, Python, JS)
 *
 * This is the only entry point the route handler calls.
 */

import { Flowchart, GenerationResult } from "../models/types";
import { validateFlowchart } from "../validators/flowchartValidator";
import { IRBuilder } from "./irBuilder";
import { generatePseudocode } from "../generators/pseudocode/pseudocodeGenerator";
import { generatePython } from "../generators/python/pythonGenerator";
import { generateJavaScript } from "../generators/javascript/javascriptGenerator";

export interface ConversionOutput {
  success: boolean;
  result?: GenerationResult;
  errors?: string[];
}

export function convertFlowchart(flowchart: Flowchart): ConversionOutput {
  // Step 1 – Validate
  const validation = validateFlowchart(flowchart);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  // Step 2 – Build IR
  let ir;
  try {
    const builder = new IRBuilder(flowchart);
    ir = builder.build();
  } catch (err) {
    const message = err instanceof Error ? err.message : "IR build failed.";
    return { success: false, errors: [message] };
  }

  // Step 3 – Generate outputs
  const result: GenerationResult = {
    pseudocode:  generatePseudocode(ir),
    python:      generatePython(ir),
    javascript:  generateJavaScript(ir),
  };

  return { success: true, result };
}
