const awsParamStore = require('aws-param-store');
const winston = require('winston');

const secretsManager = {
  region: 'us-east-1',
  secrets: {},
  prefetched: false,

  setRegion(region) {
    this.region = region;
  },

  loadSecrets(secretsMapping) {
    if (!this.prefetched) {
      try {
        winston.info('Prefetching secrets');

        // load secret
        const secretsKeys = Object.keys(secretsMapping);
        secretsKeys.map((key) => { // eslint-disable-line array-callback-return
          this.secrets[key] = awsParamStore.getParameterSync(secretsMapping[key], {
            region: this.region,
          }).Value;
        });

        this.prefetched = true;
        winston.info(`Loaded ${secretsKeys.length} secrets`);
      } catch (err) {
        winston.error(err);
      }
    } else {
      winston.info('Already prefetched, doing nothing');
    }
  },

  loadSecret(secretName, secretKey) {
    this.secrets[secretName] = awsParamStore.getParameterSync(secretKey, {
      region: this.region,
    }).Value;
  },

  getSecret(secret) {
    if (!(secret in this.secrets)) {
      winston.error('Secret not loaded, you can load it manually via loadSecret function first');
      return ;
    }
    return this.secrets[secret];
  },
};

module.exports = secretsManager;
