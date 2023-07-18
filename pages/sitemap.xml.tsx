import {GetServerSideProps} from 'next'
import React from 'react'
import {setSitemapXML} from "@/utils/sitemap-utils";

const Sitemap: React.FC = () => null


export const getServerSideProps: GetServerSideProps = async ({res: response, resolvedUrl: path}) => {
    const endpoint = 'https://sandbox-sales02.bloomreach.io/delivery/site/v1/channels/brcontenttest/pages/';
    await setSitemapXML(response, endpoint, path)
    return {
        props: {}
    }
}

export default Sitemap