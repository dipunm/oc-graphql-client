const { expect } = require('chai');
const injectr = require('injectr');
const sinon = require('sinon');

describe('OpenTable OC registry :: plugins :: graphql-plugin ', () => {

  describe('when calling register with an valid batchInterval', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });

    let error;
    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should not return an error', () => {
      expect(error).to.be.undefined;
    });
  });

  describe('when calling register with no serverUrl', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });
    let error;
    beforeEach((done) => {
      plugin.register({}, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should return an error saying is serverUrl invalid', () => {
      expect(error.toString()).to.contain('The serverUrl parameter is invalid');
    });
  });

  describe('when calling with the correct options', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });
    const next = sinon.spy();

    beforeEach((done) => {
      plugin.register({
        serverUrl: 'http://graphql'
      }, {}, next);
      done();
    });

    it('should call next', () => {
      expect(next.called).to.be.true;
    });
  });

  describe('when calling execute', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });
    let client;
    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should expose a query method', () => {
      expect(client).to.have.property('query');
    });
  });

  describe('when calling query and endpoint fails', () => {
    let client;
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, { statusCode: 500}, {})
    });

    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should return a failure message', (done) => {
      client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' })
        .catch(error => {
          expect(error.message).to.equal('Internal Server Error')
        }).then(done, done)
    });
  });

  describe('when calling query successfully', () => {
    let client;
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, { statusCode: 200}, { someJson: true })
    });

    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should return a failture message', (done) => {
      client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' })
        .then(res => {
          expect(res).to.eql({ someJson: true })
        }).then(done, done)
    });
  });
});