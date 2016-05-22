const request = require('request-promise');
const logger = require('winston');
const moment = require('moment');

const apiUrl = 'https://app.holaspirit.com/api';

const endpoints = {
  oauth: {
    token: 'https://app.holaspirit.com/oauth/v2/token'
  },
  organizations: {
    all: `${apiUrl}/organizations`,
    get: (id) => `${apiUrl}/organizations/${id}`,
    members: (id) => `${apiUrl}/organizations/${id}/members`,
  },
  circles: {
    all: (id) => `${apiUrl}/organizations/${id}/circles`
  },
  members: {
    all: (id) => `${apiUrl}/organizations/${id}/members`
  },
  me: `${apiUrl}/me`,
}

class Token {
  constructor(opts) {
    this.accessToken = opts.access_token;
    this.expiresAt = moment().add(opts.expires_in, 'seconds');
    this.tokenType = opts.token_type;
  }

  expired() {
    return moment().isAfter(this.expiresAt);
  }
}

/**
 * api.organization(2).circles(30);
 */
class HolaClient {
  constructor(opts) {
    this._clientId = opts.clientId;
    this._secret = opts.secret;
    this._token = undefined;
    this.organization = new Organization(this);
    this.me = new Me(this);

  }

  _auth() {
    logger.debug('Trying to retrieve access token');
    const opts = {
      uri: endpoints.oauth.token,
      qs: {
        client_id: this._clientId,
        client_secret: this._secret,
        grant_type: 'client_credentials'
      },
      json: true
    };

    return request(opts).then(res => {
       logger.debug(`Access token retrieved: ${res.access_token}`);
       this._token = new Token(res);
    });
  }

  get(uri) {
    if (this._token && !this._token.expired()) {
      let opts = {
        uri: uri,
        headers: {
          'Authorization': `Bearer ${this._token.accessToken}`
        },
        json: true
      }
      return request(opts);
    }
    return this._auth().then(() => {
      return this.get(uri);
    }).catch(err => {
      logger.error(`Error retrieving access token: ${err}`);
    });
  }
}

class Circle {
  constructor(api) {

  }
  checklists() {

  }

  metrics() {

  }

  publications() {

  }
}

class Me {
  constructor(api) {
    this._api = api;
  }

  get() {
    return this._api.get(endpoints.me);
  }


}

class Organization {
  constructor(api) {
    this._endpoints = {
      get: apiUrl + `organizations/{$id}`,
      all: apiUrl + `{apiUrlorganizations/{$id}`,
    }
    this._api = api;
  }

  members(id) {
    return this._api.get(endpoints.organizations.members(id));
  }


}

module.exports = {
  HolaClient
}