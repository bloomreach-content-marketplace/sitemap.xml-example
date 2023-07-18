import {Component, initialize, Pagination, Reference} from "@bloomreach/spa-sdk";
import {ServerResponse} from "http";
import axios from "axios";


export function flatten(array?: Component[]): Component[] {
    if (!array) {
        return [];
    }

    const flattenedArray: Component[] = [];

    for (const element of array) {
        flattenedArray.push(element);
        const children = element.getChildren();
        if (Array.isArray(children)) {
            flattenedArray.push(...flatten(children));
        }
    }

    return flattenedArray;
}

export const setSitemapXML = async (response: ServerResponse, endpoint: string, path: string, namespaceCheck?: string) => {
    if (response) {
        const configuration = {
            path,
            endpoint: endpoint
        };
        //@ts-ignore
        const page = await initialize({...configuration, httpClient: axios})
        const urls: Component = flatten(page?.getComponent().getChildren()).find((component => component?.getName() === 'urlset'));
        if (namespaceCheck && urls.getId() !== namespaceCheck) {
            console.warn('namespace ids does not match up: ', urls.getId(), namespaceCheck)
        }
        const pagination = page.getContent<Pagination>(urls.getModels<{ pagination: Reference }>().pagination)

        response.setHeader('Content-Type', 'text/xml')
        response.write(
            `<?xml version="1.0" encoding="UTF-8"?>
                   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                        ${pagination?.getItems()
                .filter(item => !page.getContent(item)?.getData<any>()?.metasitemapxml?.exclude)
                .map(item => {
                    const content = page.getContent(item)
                    const data = content?.getData<any>();
                    const lastModified: Date | undefined = data?.metasitemapxml?.lastmod && new Date(data.metasitemapxml.lastmod)
                    const priority = data?.metasitemapxml?.priority
                    return `<url>
                                                    <loc>${removeSlash(page.getChannelParameters().spaUrl)}${content?.getUrl()}</loc>
                                                    ${priority ? `<priority>${priority}</priority>` : ""}
                                                    ${lastModified ? `<lastmod>${lastModified?.toISOString()}</lastmod>` : ""}
                                                </url>`
                }).join('')}
                   </urlset>`)
        response.end()
    }
}

export function removeSlash(str: string) {
    if (str.endsWith('/')) {
        return str.slice(0, -1);
    } else {
        return str;
    }
}

export const setSitemapIndexXML = async (response: ServerResponse, endpoint: string, path: string, pattern: string = "sitemap/{pageNumber}/xml") => {
    if (response) {
        const configuration = {
            path,
            endpoint: endpoint
        };
        //@ts-ignore
        const page = await initialize({...configuration, httpClient: axios})
        const urls: Component = flatten(page?.getComponent().getChildren()).find((component => component?.getName() === 'sitemap'));
        const pagination = page.getContent<Pagination>(urls.getModels<{ pagination: Reference }>().pagination)
        const sitemaps = Math.ceil(pagination?.getTotal() / 200)
        response.setHeader('Content-Type', 'text/xml')
        response.write(
            `<?xml version="1.0" encoding="UTF-8"?>
                    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    ${Array.from({length: sitemaps}, (_, index) => index + 1)
                .map((pageNumber) => `<loc>${page.getChannelParameters().spaUrl}${pattern.replace('{pageNumber}', pageNumber.toString())}</loc>`)
                .join('')}
                   </sitemapindex>`)
        response.end()
    }
}

export const setPaginatedSitemapXML = async (response: ServerResponse, endpoint: string, path: string, namespace: string, pageNumber: string) => {
    const newPath = `${path}?${namespace}:page=${pageNumber}&${namespace}:limit=1`
    return setSitemapXML(response, endpoint, newPath, namespace);
}