import {GetServerSideProps} from 'next'
import React from 'react'
import {setPaginatedSitemapXML} from "@/utils/sitemap-utils";

const Sitemap: React.FC = () => null


export const getServerSideProps: GetServerSideProps = async ({res: response, resolvedUrl: path, req, query}) => {
    const {pageNumber} = query
    const endpoint = 'https://sandbox-sales02.bloomreach.io/delivery/site/v1/channels/brcontenttest/pages/';
    await setPaginatedSitemapXML(response, endpoint, `sitemap.xml`, 'r3_r1', pageNumber as string)
    return {
        props: {}
    }
}

export default Sitemap