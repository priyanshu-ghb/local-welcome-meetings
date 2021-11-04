import type { NextApiRequest, NextApiResponse } from 'next'
import { corsGET, runMiddleware } from '../../utils/cors';
import { requestHandler } from 'timesync/server'
import { withSentry } from '@sentry/nextjs';

async function handler (req: NextApiRequest, res: NextApiResponse<any>) {
  await runMiddleware(req, res, corsGET)
  return requestHandler(req, res)
}

// @ts-ignore
export default withSentry(handler)