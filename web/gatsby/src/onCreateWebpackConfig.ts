import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { GatsbyNode } from 'gatsby';

const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  actions,
}): void => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
    },
  });
};

export default onCreateWebpackConfig;
