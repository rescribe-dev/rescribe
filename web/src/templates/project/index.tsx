import React from 'react';
import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';

import ProjectContent, {
  ProjectPageDataProps,
} from 'components/templates/project/index';
import ProjectMessagesEnglish from 'locale/templates/project/en';

const ProjectPage = (args: ProjectPageDataProps): JSX.Element => {
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Project" />
        <ProjectContent {...args} messages={ProjectMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default ProjectPage;
