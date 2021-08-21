import { Client } from '@hubspot/api-client'
import env from 'env-var';
import qs from 'query-string'

const HUBSPOT_API_KEY = env.get('HUBSPOT_API_KEY').required().asString()

export const hubspotV3 = new Client({ apiKey: HUBSPOT_API_KEY })

export const hubspotV1 = async (path: string, args?: RequestInit) => {
  const url = qs.stringifyUrl({
    url: `https://api.hubapi.com/contacts/v1${path}`,
    query: { hapikey: HUBSPOT_API_KEY }
  })
  const res = await fetch(url, args)
  return await res.json()
}