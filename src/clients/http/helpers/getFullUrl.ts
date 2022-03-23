import * as urlJoin from 'url-join';

export function getFullUrl(baseUrl: string, url: string): string {
  return urlJoin(baseUrl, url);
}

