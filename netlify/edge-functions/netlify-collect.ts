/**
 * Query the contest API to get the current status and render the response in
 * the <netlify-collect> component on the page.
 */

import { HTMLRewriter, type Element } from 'https://ghuc.cc/worker-tools/html-rewriter/index.ts';
import { Config, Context } from '@netlify/edge-functions';

class ElementHandler {
  private hostname: string;

  constructor(hostname: string) {
    this.hostname = hostname;
  }

  async element(element: Element) {
    // Build the URL to query
    const apiBaseUrl = 'https://webu24.netlify.app';
    const params: Record<string, string> = { id: this.hostname };
    const apiUrl = new URL('/submissions/html', apiBaseUrl);
    Object.keys(params).forEach((key) => apiUrl.searchParams.append(key, params[key] as string));

    const response = await fetch(apiUrl.toString());
    const resBody = await response.json();

    if (response.ok && resBody.html?.length > 0) {
      element.replace(resBody.html, { html: true });
    } else {
      console.log(`Could not get html to render page.`, JSON.stringify(resBody, null, 2));
    }
  }
}

export default async (request: Request, context: Context) => {
  const response = await context.next();
  const hostname = new URL(request.url).hostname;
  return new HTMLRewriter().on('netlify-collect', new ElementHandler(hostname)).transform(response);
};

export const config: Config = {
  path: '/',
};
