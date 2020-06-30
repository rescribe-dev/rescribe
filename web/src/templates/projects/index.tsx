import React from 'react';
import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';

import ProjectsContent, {
  ProjectsPageDataProps,
} from 'components/templates/projects/index';
import ProjectsMessagesEnglish from 'locale/templates/projects/en';

const ProjectsPage = (args: ProjectsPageDataProps): JSX.Element => {
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Projects" />
        <ProjectsContent {...args} messages={ProjectsMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default ProjectsPage;
