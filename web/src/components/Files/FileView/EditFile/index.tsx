import React from 'react';
import { Button, Container } from 'reactstrap';

interface EditFileProps {
  fileText: string[];
  onExit: (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const EditFile = (args: EditFileProps): JSX.Element => {
  return (
    <Container>
      <Button onClick={args.onExit}>Submit</Button>
    </Container>
  );
};

export default EditFile;
