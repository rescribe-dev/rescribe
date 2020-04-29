import React, { useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import Img, { FluidObject } from "gatsby-image";
import { graphql } from "gatsby";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";

import Layout from "../layouts/index";
import SEO from "../components/seo";
import "./index.scss";

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

interface IndexPageProps {
  data: {
    background: {
      childImageSharp: {
        fluid: FluidObject;
      };
    };
    logo: {
      childImageSharp: {
        fluid: FluidObject;
      };
    };
  };
}

interface EmailListArgs {
  token: string;
  email: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const IndexPage = (args: IndexPageProps) => {
  const [sending, setSending] = useState(false);
  const formik = useFormik({
    validationSchema: yup.object({
      email: yup.string().email("invalid email address").required("required"),
    }),
    initialValues: {
      email: "",
    },
    onSubmit: (formData, { setSubmitting, setStatus, resetForm }) => {
      setSending(true);
      if (!window.grecaptcha) {
        toast("cannot find recaptcha", {
          type: "error",
        });
        setSending(false);
        return;
      }
      window.grecaptcha.ready(() => {
        const onError = () => {
          setStatus({ success: false });
          setSubmitting(false);
          setSending(false);
        };
        try {
          window.grecaptcha
            .execute(process.env.GATSBY_RECAPTCHA_SITE_KEY, {
              action: "login",
            })
            .then((recaptchaToken: string) => {
              const listArgs: EmailListArgs = {
                email: formData.email,
                token: recaptchaToken,
              };
              axios
                .post("/emaillist", listArgs, {
                  baseURL: process.env.GATSBY_FUNCTIONS_URL,
                })
                .then((res) => {
                  console.log(res.data);
                  toast(`successfully registered ${listArgs.email}`, {
                    type: "success",
                  });
                  resetForm({});
                  setStatus({
                    success: true,
                  });
                  setSending(false);
                })
                .catch((err: any) => {
                  toast(err.response.data.message, {
                    type: "error",
                  });
                  onError();
                });
            })
            .catch((err: Error) => {
              toast(err.message, {
                type: "error",
              });
              onError();
            });
        } catch (err) {
          // console.error(err);
        }
      });
    },
  });
  return (
    <Layout>
      <SEO title="Rescribe" />
      <div className="middle-container">
        <div className="box">
          <div>
            <Img
              fluid={args.data.logo.childImageSharp.fluid}
              className="logo"
            />
            <h2>COMING SOON</h2>
            <hr />
            <Form.Group
              style={{
                margin: 0,
                padding: 0,
              }}
            >
              <Form.Control
                id="email"
                name="email"
                type="email"
                placeholder="Enter email >"
                onKeyDown={(evt: any) => {
                  if (evt.key === "Enter") {
                    formik.handleSubmit();
                  }
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                isInvalid={!!formik.errors.email}
                className="shadow-none"
                disabled={sending}
              />
              <BeatLoader
                css={loaderCSS}
                size={10}
                color={"red"}
                loading={sending}
              />
              <Form.Control.Feedback className="feedback" type="invalid">
                {formik.errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </div>
      </div>
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%",
          }}
        >
          <Img
            className="background-image"
            fluid={args.data.background.childImageSharp.fluid}
          />
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query {
    background: file(absolutePath: { regex: "//images/background.png/" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fluid(fit: COVER) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    logo: file(absolutePath: { regex: "//images/logo.png/" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fluid(fit: COVER) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`;
