import { 
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};


const userPool = new CognitoUserPool(poolData);

export function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        console.log("✅ Login success!");
        console.log("Access Token:", result.getAccessToken().getJwtToken());
        resolve(result);
      },
      onFailure: (err) => {
        console.error("❌ Login failed:", err.message);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        const newPassword = prompt("This is a temporary password. Enter a new password:");
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: (res) => resolve(res),
          onFailure: (err) => reject(err),
        });
      }
    });
  });
}

