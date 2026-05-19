import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: `${process.env.REACT_APP_CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose,
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
        }
      },
    },
  },
};
