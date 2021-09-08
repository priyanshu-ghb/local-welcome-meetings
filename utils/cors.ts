import Cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next';

// Initializing the cors middleware
export const corsGET = Cors({
  methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: <T>(req: NextApiRequest, res: NextApiResponse, fn: (result: T) => any) => any
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}