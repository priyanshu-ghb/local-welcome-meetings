import useSWR from 'swr';
import { SelectOption } from '@notionhq/client/build/src/api-types';

export const useSlideshowOptions = () => {
  return useSWR<{ slideshowOptions: SelectOption[] }>(`/api/slideshowOptions`, { suspense: true })
}