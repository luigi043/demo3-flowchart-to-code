/**
 * /api/convert  POST
 *
 * Accepts a Flowchart JSON body and returns pseudocode, Python, and
 * JavaScript code (or a list of validation errors).
 */

import { Router, Request, Response } from "express";
import { ConvertRequest, ConvertResponse } from "../models/types";
import { convertFlowchart } from "../services/conversionService";

const router = Router();

router.post("/convert", (req: Request, res: Response) => {
  const body = req.body as ConvertRequest;

  if (!body?.flowchart) {
    const resp: ConvertResponse = {
      success: false,
      errors: ['Request body must contain a "flowchart" key.'],
    };
    return res.status(400).json(resp);
  }

  const output = convertFlowchart(body.flowchart);

  const resp: ConvertResponse = {
    success: output.success,
    result:  output.result,
    errors:  output.errors,
  };

  return res.status(output.success ? 200 : 422).json(resp);
});

export default router;
