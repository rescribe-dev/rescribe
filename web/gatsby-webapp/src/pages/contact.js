import React from 'react'
import Layout from '../components/layout'

const ContactPage = () => {
    return (
        <Layout>
            <h1>This is the contact page</h1>
            <p>This is some contact info</p>
            <p>This is a link to send you to <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">Google</a></p>
        </Layout>
    )
}

export default ContactPage