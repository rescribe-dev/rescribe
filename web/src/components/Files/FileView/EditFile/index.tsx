import { Formik } from 'formik';
import React from 'react';
import { toast } from 'react-toastify';
import { Button, Container, Form, FormFeedback, FormGroup, Input } from 'reactstrap';
import { client } from 'utils/apollo';
import * as yup from 'yup';

interface EditFileProps {
  fileText: string[];
  onExit: (newText: string) => void;
}

const EditFile = (args: EditFileProps): JSX.Element => {
  return (
    <Container>
      <Formik
        initialValues={{
          text: args.fileText.join('\n'),
        }}
        validationSchema={yup.object({
          text: yup.string().required('required'),
        })}
        onSubmit={async (formData, { setSubmitting, setStatus }) => {
          const onError = () => {
            setStatus({ success: false });
            setSubmitting(false);
          };
          try {
            // TODO send data to api here
            // await client.mutate<indexFiles, indexFilesArgs>({
            //   fileText= FileText
            // })
            // then run onExit
            args.onExit(formData.text);
          } catch (err) {
            toast(err.message, {
              type: 'error',
            });
            onError();
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  id="text"
                  name="text"
                  type="text"
                  placeholder="text"
                  className="form-input"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.text}
                  invalid={
                    !!(touched.text && errors.text)
                  }
                  disabled={isSubmitting}
                />
                <FormFeedback
                  style={{
                    marginBottom: '1rem',
                  }}
                  className="feedback"
                  type="invalid"
                >
                  {touched.text && errors.text
                    ? errors.text
                    : ''}
                </FormFeedback>
              </FormGroup>
              <Button
                type="submit"
                style={{
                  width: '100%',
                }}
                color="primary"
                onClick={(evt: React.MouseEvent) => {
                  evt.preventDefault();
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                Submit
            </Button>
            </Form>
          )}
      </Formik>
    </Container>
  );
};

export default EditFile;
