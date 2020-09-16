import AWS from 'aws-sdk';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { UpdateDistributionRequest, DistributionConfig } from 'aws-sdk/clients/cloudfront';

const lambdaTypes: string[] = ['origin-request', 'viewer-response', 'viewer-request'];

const uploadFunction = async (lambdaFunction: string, sourceZip: string): Promise<string> => {
  const lambdaClient = new AWS.Lambda();
  return new Promise<string>((resolve, reject) => {
    lambdaClient.updateFunctionCode({
      FunctionName: lambdaFunction,
      Publish: true,
      ZipFile: readFileSync(sourceZip)
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.FunctionArn as string);
      }
    });
  });
};

const updateCloudfront = async (arn: string, cloudfrontID: string, lambdaType: string)
  : Promise<void> => {
  const cloudfrontClient = new AWS.CloudFront();
  return new Promise<void>((resolve, reject) => {
    cloudfrontClient.getDistributionConfig({
      Id: cloudfrontID
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (!data.DistributionConfig) {
          reject(new Error('cannot find distribution config'));
          return;
        }
        const config = data.DistributionConfig as DistributionConfig;
        let foundFunction = false;
        const functionItems = config.DefaultCacheBehavior.LambdaFunctionAssociations?.Items;
        if (functionItems) {
          for (const item of functionItems) {
            if (item.EventType === lambdaType) {
              item.LambdaFunctionARN = arn;
              foundFunction = true;
            }
          }
        }
        if (!foundFunction) {
          reject(new Error('cannot find function in distribution'));
          return;
        }
        const updateData: UpdateDistributionRequest = {
          Id: cloudfrontID,
          DistributionConfig: config,
          IfMatch: data.ETag
        };
        cloudfrontClient.updateDistribution(updateData, (err2) => {
          if (err2) {
            reject(err2);
          } else {
            resolve();
          }
        });
      }
    });
  });
};

const runAction = async (): Promise<void> => {
  config();
  if (!process.env.AWS_CLOUDFRONT_ID) {
    throw new Error('cloudfront id not provided');
  }
  const cloudfrontID = process.env.AWS_CLOUDFRONT_ID;
  if (!process.env.LAMBDA_FUNCTION) {
    throw new Error('lambda function not provided');
  }
  const lambdaFunction = process.env.LAMBDA_FUNCTION;
  if (!process.env.SOURCE) {
    throw new Error('source zip provided');
  }
  const lambdaType = lambdaTypes.find(type => lambdaFunction.includes(type));
  if (!lambdaType) {
    throw new Error('unsupported function name provided');
  }
  const sourceZip = process.env.SOURCE;
  AWS.config = new AWS.Config();
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('no aws access key id provided');
  }
  AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('no aws secret access key provided');
  }
  AWS.config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!process.env.AWS_REGION) {
    throw new Error('no aws region provided');
  }
  AWS.config.region = process.env.AWS_REGION;
  const arn = await uploadFunction(lambdaFunction, sourceZip);
  await updateCloudfront(arn, cloudfrontID, lambdaType);
};

if (require.main) {
  runAction().then(() => {
    console.log('done with cloudfront lambda deploy');
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}

export default runAction;
