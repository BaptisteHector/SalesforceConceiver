import { Injectable } from '@angular/core';

@Injectable()
export class ForceService {

  win: any = window;

  // The login URL for the OAuth process
  // To override default, pass loginURL in init(props)
  loginURL = 'https://login.salesforce.com';

  // The Connected App client Id. Default app id provided - Not for production use.
  // This application supports http://localhost:8200/oauthcallback.html as a valid callback URL
  // To override default, pass appId in init(props)
  appId = '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92';

  // The force.com API version to use.
  // To override default, pass apiVersion in init(props)
  apiVersion = 'v35.0';

  // Keep track of OAuth data (access_token, refresh_token, and instance_url)
  oauth: any;

  tokenStore: any = {};

  // if page URL is http://localhost:3000/myapp/index.html, context is /myapp
  context: string = this.win.location.pathname.substring(0, this.win.location.pathname.lastIndexOf('/'));

  // if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
  serverURL = this.win.location.protocol + '//' + this.win.location.hostname + (this.win.location.port ? ':' + this.win.location.port : '');

  // if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
  baseURL: string = this.serverURL + this.context;

  // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
  // To override default, pass proxyURL in init(props)
  proxyURL = 'https://dev-cors-proxy.herokuapp.com/';

  // if page URL is http://localhost:3000/myapp/index.html, oauthCallbackURL is http://localhost:3000/myapp/oauthcallback.html
  // To override default, pass oauthCallbackURL in init(props)
  //oauthCallbackURL: string = encodeURIComponent(this.baseURL + '/oauthcallback.html'); // working
  oauthCallbackURL: string = this.baseURL + '/oauthcallback.html';
  // oauthCallbackURL : string = encodeURIComponent(this.baseURL + '/auth-callback.html'); //not working
  // Reference to the Salesforce OAuth plugin
  oauthPlugin: any;

  // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova, in a VF page,
  // or using the Salesforce console. Can be overriden in init()
  // useProxy : any = (this.win.cordova || this.win.SfdcApp || this.win.sforce) ? false : true;
  useProxy: any = (this.win.cordova || this.win.SfdcApp || this.win.sforce) ? false : true;


  isLoggedIn = () => {
    if (localStorage.getItem('SFToken')) {
      return true;
    } else {
      return false;
    }
  }

  /*
   * Determines the request base URL.
   */
  getRequestBaseURL = () => {

    let url: any;
    if (this.useProxy) {
      url = this.proxyURL;
    } else
      if (this.oauth.instance_url) {
        url = this.oauth.instance_url;
      } else {
        url = this.serverURL;
      }

    // dev friendly API: Remove trailing '/' if any so url + path concat always works
    if (url.slice(-1) === '/') {
      url = url.slice(0, -1);
    }

    return url;
  }

  parseQueryString = (queryString: string) => {
    const temp = queryString.split('#');
    queryString = temp.length === 1 ? queryString : temp[temp.length - 1];
    const qs = decodeURIComponent(queryString),
      obj = new Array(),
      params = qs.split('&');
    params.forEach(param => {
      const splitter: Array<string> = param.split('=');
      obj[+splitter[0]] = decodeURIComponent(splitter[1]);
    });
    return obj;
  }

  toQueryString = (obj: any) => {
    const parts: any = [];
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
      }
    }
    return parts.join('&');
  }

  refreshTokenWithPlugin = () => {

    return new Promise<void>((resolve, reject) => {
      this.oauthPlugin.authenticate(
         (response: any) => {
          this.oauth.access_token = response.accessToken;
          this.tokenStore.forceOAuth = JSON.stringify(this.oauth);
          resolve();
        },
        function () {
          console.error('Error refreshing oauth access token using the oauth plugin');
          reject();
        }
      );
    });

  }

  refreshTokenWithHTTPRequest = () => new Promise<void>((resolve, reject) => {

    if (!this.oauth.refresh_token) {
      console.log('ERROR: refresh token does not exist');
      reject();
      return;
    }

    let xhr = new XMLHttpRequest(),

      params = {
        'grant_type': 'refresh_token',
        'refresh_token': this.oauth.refresh_token,
        'client_id': this.appId
      },

      url = this.useProxy ? this.proxyURL : this.loginURL;

    url = url + '/services/oauth2/token?' + this.toQueryString(params);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          this.oauth.access_token = res.access_token;
          this.tokenStore.forceOAuth = JSON.stringify(this.oauth);
          resolve();
        } else {
          console.log('Error while trying to refresh token: ' + xhr.responseText);
          reject();
        }
      }
    };

    xhr.open('POST', url, true);
    if (!this.useProxy) {
      xhr.setRequestHeader('Target-URL', this.loginURL);
    }
    xhr.send();

  })

  refreshToken = () => {
    if (this.oauthPlugin) {
      return this.refreshTokenWithPlugin();
    } else {
      return this.refreshTokenWithHTTPRequest();
    }
  }

  joinPaths = (path1: string, path2: string) => {
    if (path1.charAt(path1.length - 1) !== '/') { path1 = path1 + '/'; }
    if (path2.charAt(0) === '/') { path2 = path2.substr(1); }
    return path1 + path2;
  }

  /**
   * Initialize ForceJS
   * @param params
   *  appId (optional)
   *  loginURL (optional)
   *  proxyURL (optional)
   *  oauthCallbackURL (optional)
   *  apiVersion (optional)
   *  accessToken (optional)
   *  instanceURL (optional)
   *  refreshToken (optional)
   */
  init = (params: any) => {

    if (params) {
      this.appId = params.appId || this.appId;
      this.apiVersion = params.apiVersion || this.apiVersion;
      this.loginURL = params.loginURL || this.loginURL;
      this.oauthCallbackURL = params.oauthCallbackURL || this.oauthCallbackURL;
      this.proxyURL = params.proxyURL || this.proxyURL;
      this.useProxy = params.useProxy === undefined ? this.useProxy : params.useProxy;

      if (params.accessToken) {
        if (!this.oauth) this.oauth = {};
        this.oauth.access_token = params.accessToken;
      }

      if (params.instanceURL) {
        if (!this.oauth) this.oauth = {};
        this.oauth.instance_url = params.instanceURL;
      }

      if (params.refreshToken) {
        if (!this.oauth) this.oauth = {};
        this.oauth.refresh_token = params.refreshToken;
      }
    }
  }

  /**
   * Discard the OAuth access_token. Use this function to test the refresh token workflow.
   */
  discardToken = () => {
    delete this.oauth.access_token;
    this.tokenStore.forceOAuth = JSON.stringify(this.oauth);
  }

  /**
   * Login to Salesforce using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
   * If running in Cordova container, it happens using the Mobile SDK 2.3+ Oauth Plugin
   */
  loginCalled: Boolean = false;
  login = () => {
    if (!this.loginCalled) {
      this.loginCalled = true;
      if (this.win.cordova) {
        return this.loginWithPlugin();
      } else {
        return this.loginWithBrowser();
      }
    }
    return null
  }

  loginWithPlugin = () => new Promise<void>((resolve, reject) => {
    document.addEventListener('deviceready', () => {
      this.oauthPlugin = this.win.cordova.require('com.salesforce.plugin.oauth');
      if (!this.oauthPlugin) {
        console.error('Salesforce Mobile SDK OAuth plugin not available');
        reject('Salesforce Mobile SDK OAuth plugin not available');
        return;
      }
      this.oauthPlugin.getAuthCredentials(
         (creds: any) => {
          // Initialize ForceJS
          this.init({
            accessToken: creds.accessToken,
            instanceURL: creds.instanceUrl,
            refreshToken: creds.refreshToken
          });
          resolve();
        },
        function (error: any) {
          console.log(error);
          reject(error);
        }
      );
    }, false);
  })

  checkIfSessionIdIsValid = () => new Promise((resolve, reject) => {
    let method = 'GET',
      xhr = new XMLHttpRequest(),
      url = this.getRequestBaseURL();

    url = url + '/services/data/v35.0/query/?q=SELECT id from Account LIMIT 1';
    let _self = this;

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status > 199 && xhr.status < 300) {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
        } else if (xhr.status === 401) {
          // Try again with the new token
          try {
            const test = JSON.parse(xhr.responseText);
            if (test && test[0] && test[0].errorCode && test[0].errorCode == 'INVALID_SESSION_ID') {
              localStorage.removeItem('SFToken');
              _self.loginWithBrowser().then(() => {
                resolve('');
                // resolve(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
              });
            }
          } catch (e) {
            console.error(xhr.responseText);
          }
        } else {
          let error: any;
          try {
            error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Server error while executing request' };
          } catch (ex) {
            error = xhr.responseText;
          }
          reject(error);
        }
      }
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.oauth.access_token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (this.useProxy) {
      xhr.setRequestHeader('Target-URL', this.oauth.instance_url);
    }
    xhr.send(undefined);
  })

  loginWithBrowser = () => new Promise<void>((resolve, reject) => {
    if (localStorage.getItem('SFToken')) {
      const self = this;
      this.oauth = JSON.parse((localStorage.getItem('SFToken') || ''));
      this.tokenStore.forceOAuth = JSON.stringify(this.oauth);
      this.checkIfSessionIdIsValid().then(function (data) {
        self.loginCalled = false;
        resolve();
      }, function (error) {
        reject(error);
      });
    } else {
      let loginWindowURL = this.loginURL + '/services/oauth2/authorize?client_id=' + this.appId + '&redirect_uri=' + this.oauthCallbackURL + '&response_type=token';
      document.addEventListener('oauthCallback', (evt) => {

        const event: any = evt;
        // Parse the OAuth data received from Salesforce
        let url: any = event.detail, queryString: any,
          obj: any;

        if (url.indexOf('access_token=') > 0) {
          queryString = url.substr(url.indexOf('#') + 1);
          obj = this.parseQueryString(queryString);
          console.log('obj', obj);
          localStorage.setItem('SFToken', JSON.stringify(obj));
          this.oauth = obj;
          this.tokenStore.forceOAuth = JSON.stringify(this.oauth);
          this.loginCalled = false;
          resolve();
        } else if (url.indexOf('error=') > 0) {
          queryString = decodeURIComponent(url.substring(url.indexOf('?') + 1));
          obj = this.parseQueryString(queryString);
          reject(obj);
        } else {
          reject({ status: 'access_denied' });
        }
      });
      this.win.open(loginWindowURL, '_blank', 'location=no');
    }
  })

  /**
   * Gets the user's ID (if logged in)
   * @returns {string} | undefined
   */
  getUserId = () => (typeof (this.oauth) !== 'undefined') ? this.oauth.id.split('/').pop() : undefined;

  /**
   * Get the OAuth data returned by the Salesforce login process
   */
  getOAuthResult = () => this.oauth;

  /**
   * Check the login status
   * @returns {boolean}
   */
  isAuthenticated = () => (this.oauth && this.oauth.access_token) ? true : false;

  /**
   * Lets you make any Salesforce REST API request.
   * @param obj - Request configuration object. Can include:
   *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
   *  path:    path in to the Salesforce endpoint - Required
   *  params:  queryString parameters as a map - Optional
   *  data:  JSON object to send in the request body - Optional
   */
  request = (obj: any) => new Promise((resolve, reject) => {

    if (!this.oauth || (!this.oauth.access_token)) {
      reject('No access token. Please login and try again.');
      /*	 this.login().then(() => {
          this.request(obj).then((data:any) => {
            resolve(data);
          });
        });  */
      // return;
    }

    let method = obj.method || 'GET',
      xhr = new XMLHttpRequest(),
      url = this.getRequestBaseURL();
    // dev friendly API: Add leading '/' if missing so url + path concat always works
    if (obj.path.charAt(0) !== '/') {
      obj.path = '/' + obj.path;
    }
    url = url + obj.path;

    if (obj.params) {
      url += '?' + this.toQueryString(obj.params);
    }
    xhr.onreadystatechange = () => {

      if (xhr.readyState === 4) {
        if (xhr.status > 199 && xhr.status < 300) {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
        } else if (xhr.status === 401 && this.oauth.refresh_token) {
          this.refreshToken()
            // Try again with the new token
            .then(() => this.request(obj).then(data => resolve(data)).catch(error => reject(error)))
            .catch(() => {

              try {
                const test = JSON.parse(xhr.responseText);
                if (test && test[0] && test[0].errorCode && test[0].errorCode === 'INVALID_SESSION_ID') {
                  localStorage.removeItem('SFToken');
                  this.login()?.then(() => {
                    this.request(obj).then((data: any) => {
                      resolve(data);
                      // resolve(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
                    });
                  });
                } else {
                  console.error(xhr.responseText);
                  const error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Server error while refreshing token' };
                  reject(error);
                }
              } catch (e) {
                console.error(xhr.responseText);
              }
            });
        } else {
          let error: any;
          try {
            error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Server error while executing request' };
          } catch (ex) {
            error = xhr.responseText;
          }
          reject(error);
        }
      }
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.oauth.access_token);
    if (obj.contentType) {
      xhr.setRequestHeader('Content-Type', obj.contentType);
    }
    if (this.useProxy) {
      xhr.setRequestHeader('Target-URL', this.oauth.instance_url);
    }
    xhr.send(obj.data ? JSON.stringify(obj.data) : undefined);

  })

  /**
   * Convenience function to execute a SOQL query
   * @param soql
   */
  query = (soql: string) => this.request(
    {
      path: '/services/data/' + this.apiVersion + '/query',
      params: { q: soql }
    }
  )

  /**
   * Convenience function to retrieve a single record based on its Id
   * @param objectName
   * @param id
   * @param fields
   */
  retrieve = (objectName: string, id: string, fields: any) => this.request({
    path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + id,
    params: fields ? { fields: fields } : undefined
  }
  )

  /**
   * Convenience function to retrieve picklist values from a SalesForce Field
   * @param objectName
   */
  getPickListValues = (objectName: string) => this.request({
    path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/describe'
  }
  )

  /**
   * Convenience function to create a new record
   * @param objectName
   * @param data
   */
  create = (objectName: string, data: any) => this.request({
    method: 'POST',
    contentType: 'application/json',
    path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/',
    data: data
  }
  )

  /**
   * Convenience function to update a record. You can either pass the sobject returned by retrieve or query or a simple JavaScript object.
   * @param objectName
   * @param data The object to update. Must include the Id field.
   */
  update = (objectName: string, data: any) => {

    const id = data.Id || data.id,
      fields = JSON.parse(JSON.stringify(data));

    delete fields.attributes;
    delete fields.Id;
    delete fields.id;

    return this.request({
      method: 'POST',
      contentType: 'application/json',
      path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + id,
      params: { '_HttpMethod': 'PATCH' },
      data: fields
    }
    );
  }

  /**
   * Convenience function to delete a record
   * @param objectName
   * @param id
   */
  del = (objectName: string, id: string) => this.request({
    method: 'DELETE',
    path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + id
  }
  )

  /**
   * Convenience function to upsert a record
   * @param objectName
   * @param externalIdField
   * @param externalId
   * @param data
   */
  upsert = (objectName: string, externalIdField: string, externalId: string, data: string) => this.request({
    method: 'PATCH',
    contentType: 'application/json',
    path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + externalIdField + '/' + externalId,
    data: data
  }
  )

  /**
   * Convenience function to invoke APEX REST endpoints
   * @param pathOrParams
   */
  apexrest = (pathOrParams: any) => {

    let params: any;

    if (pathOrParams.substring) {
      params = { path: pathOrParams };
    } else {
      params = pathOrParams;

      if (params.path.charAt(0) !== '/') {
        params.path = '/' + params.path;
      }

      if (params.path.substr(0, 18) !== '/services/apexrest') {
        params.path = '/services/apexrest' + params.path;
      }
    }

    return this.request(params);
  }

  /**
   * Convenience function to invoke the Chatter API
   * @param pathOrParams
   */
  chatter = (pathOrParams: any) => {

    const basePath = '/services/data/' + this.apiVersion + '/chatter';
    let params: any;

    if (pathOrParams && pathOrParams.substring) {
      params = { path: this.joinPaths(basePath, pathOrParams) };
    } else if (pathOrParams && pathOrParams.path) {
      params = pathOrParams;
      params.path = this.joinPaths(basePath, pathOrParams.path);
    } else {
      return new Promise((resolve, reject) => reject('You must specify a path for the request'));
    }

    return this.request(params);

  }


}
