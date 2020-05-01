import React from 'react'
import { Link } from 'gatsby'

import Layout from "../components/layout"

const IndexPage = () => {
    return (
        <Layout>
            <h1>Hello</h1>
            <h2>I'm Mike, this is some filler text</h2>
            <p>Need a developer with an optimized link? <Link to="/contact">Contact me.</Link></p>
        </Layout>
    )
}


export default IndexPage