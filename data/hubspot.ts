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

export const getHubspotContactsInList = async (listId: string | number) => {
  return await hubspotV1(`/lists/${listId}/contacts/all`) as HubspotContactListResponse
}

export const getDetailsForContact = (contact: Contact) => {
  const contactData = contact['identity-profiles'].reduce((acc, profile) => {
    profile.identities.forEach((identity) => {
      acc[identity.type] ??= []
      acc[identity.type].push(identity)
      // @ts-ignore
      acc[identity.type].sort((a, b) => (a['is-primary'] || false) - (b['is-primary'] || false))
    })
    return acc
  }, {} as { EMAIL: Identity[], [type: string]: Identity[] })

  return contactData
}

export interface HubspotContactListResponse {
  contacts:     Contact[];
  "has-more":   boolean;
  "vid-offset": number;
}

export interface Contact {
  addedAt:             number;
  vid:                 number;
  "canonical-vid":     number;
  "merged-vids":       number[];
  "portal-id":         number;
  "is-contact":        boolean;
  properties:          Properties;
  "form-submissions":  FormSubmission[];
  "identity-profiles": IdentityProfile[];
  "merge-audits":      MergeAudit[];
}

export interface FormSubmission {
  "conversion-id":          string;
  timestamp:                number;
  "form-id":                string;
  "portal-id":              number;
  "page-url":               string;
  "page-title":             string;
  title:                    string;
  "form-type":              string;
  "meta-data":              any[];
  "contact-associated-by"?: ContactAssociatedBy[];
}

export enum ContactAssociatedBy {
  Email = "EMAIL",
  LeadGUID = "LEAD_GUID",
}

export interface IdentityProfile {
  vid:                         number;
  "saved-at-timestamp":        number;
  "deleted-changed-timestamp": number;
  identities:                  Identity[];
}

export interface Identity {
  type:            ContactAssociatedBy;
  value:           string;
  timestamp:       number;
  "is-primary"?:   boolean;
  "is-secondary"?: boolean;
}

export interface MergeAudit {
  "canonical-vid":        number;
  "vid-to-merge":         number;
  timestamp:              number;
  "entity-id":            string;
  "user-id":              number;
  "num-properties-moved": number;
  merged_from_email:      MergedEmail;
  merged_to_email:        MergedEmail;
  "first-name":           string;
  "last-name":            string;
}

export interface MergedEmail {
  value:                string;
  "source-type":        string;
  "source-id":          string;
  "source-label":       null;
  "source-vids"?:       number[];
  "updated-by-user-id": null;
  timestamp:            number;
  selected:             boolean;
}

export interface Properties {
  firstname:        Firstname;
  lastmodifieddate: Firstname;
  lastname:         Firstname;
}

export interface Firstname {
  value: string;
}
