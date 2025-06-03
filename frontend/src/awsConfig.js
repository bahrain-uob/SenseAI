import { CognitoUserPool } from "amazon-cognito-identity-js";

export const poolData = new CognitoUserPool ({
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
});

