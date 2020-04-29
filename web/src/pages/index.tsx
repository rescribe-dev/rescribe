import React, { useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { css } from "@emotion/core";
import { Container } from "react-bootstrap";
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
  data: {};
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const IndexPage = (_args: IndexPageProps) => {
  const [sending, setSending] = useState(false);
  const formik = useFormik({
    validationSchema: yup.object({
      email: yup.string().email("invalid email address").required("required"),
      password: yup.string(),
    }),
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (_formData, { setSubmitting, setStatus, resetForm }) => {
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
              console.log(recaptchaToken);
              resetForm();
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
      <Container
        style={{
          marginTop: "3rem",
          marginBottom: "5rem",
        }}
      >
        <Form.Group>
          <Form.Control
            id="email"
            style={{
              marginBottom: "1rem",
            }}
            name="email"
            type="email"
            placeholder="Email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            isInvalid={!!formik.errors.email}
            disabled={sending}
          />
          <Form.Control
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onKeyDown={(evt: any) => {
              if (evt.key === "Enter") {
                formik.handleSubmit();
              }
            }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            isInvalid={!!formik.errors.password}
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
      </Container>
    </Layout>
  );
};

export default IndexPage;
