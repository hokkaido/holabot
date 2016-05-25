const request = require('request-promise');
const logger = require('winston');
const moment = require('moment');

const apiUrl = 'https://app.holaspirit.com/api';

const makeEndpoint = (name) => {
  return {
    all: (orgId) => `${apiUrl}/organizations/${orgId}/${name}`,
    get: (orgId, id) => `${apiUrl}/organizations/${orgId}/${name}/${id}`,
  }
}

const endpoints = {
  oauth: {
    token: 'https://app.holaspirit.com/oauth/v2/token'
  },
  organizations: {
    get: (id) => `${apiUrl}/organizations/${id}`,
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

class Resource {
  constructor(api, name) {
    this._api = api;
    this._endpoints = makeEndpoint(name);
    console.log(this._endpoints);
  }

  all() {
    return this._api.get(this._endpoints.all(this._api._orgId));
  }

  get(id) {
    return this._api.get(this._endpoints.get(this._api._orgId, id));
  }
}

/**
 * api.circles(30);
 */
class HolaClient {
  constructor(opts) {
    this._clientId = opts.clientId;
    this._secret = opts.secret;
    this._username = opts.username;
    this._password = opts.password;
    this._orgId = opts.organization;
    this._token = undefined;

    this.me = new Me(this);
    this.actions = new Resource(this, 'actions');
    this.circles = new Resource(this, 'circles');
    this.gogs = new Resource(this, 'gogs');
    this.members = new Resource(this, 'members');
    this.projects = new Resource(this, 'projects');
    this.roles = new Resource(this, 'roles');
    this.tensions = new Resource(this, 'tensions');
    this.users = new Resource(this, 'users');
  }

  _auth() {
    logger.debug('Trying to retrieve access token');
    const opts = {
      uri: endpoints.oauth.token,
      qs: {
        client_id: this._clientId,
        client_secret: this._secret,
        username: this._username,
        password: this._password,
        grant_type: 'password'
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

class Me {
  constructor(api) {
    this._api = api;
  }

  get() {
    return this._api.get(endpoints.me);
  }
}

module.exports = {
  HolaClient
}