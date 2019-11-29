const assert = require('assert');
const rp = require('request-promise-native');

const baseUrl = 'http://localhost:8080/v1'
// set send time to 100 seconds in the future
const timestamp = Date.now() + 100000
const sendPayload = {
  unixTime: timestamp,
  subject: "Testing mail scheduler",
  recipients: [
    "test@example.com",
  ],
  htmlEmail:"<!doctype html><html><body><h1>Testing/h1></body></html>\n\n",
  txtEmail:"Testing\n\n"
}
const cancelPayload = { id: timestamp }

describe('Create, list and delete a campaign', function() {
  describe('Create a campaign', function() {
    it('Successfully create a campaign', async function() {
      const options = {
        method: 'POST',
        uri: baseUrl + '/send',
        body: sendPayload,
        json: true
      }
      const response = await rp(options)
      assert.equal(response.scheduled, true)
      // response.success.should.equal(true)
      // response.id.should.equal(timestamp)
      assert.equal(response.id, timestamp)
    })
  })
  describe('List our newly created campaign', function() {
    it('Returns our newly created campaign', async function() {
    const options = {
      method: 'GET',
      uri: baseUrl + '/pending',
      json: true
    }
    const response = await rp(options)
    assert.equal(Array.isArray(response.pending), true)
    // Array.isArray(response.pending).should.equal(true)
    const campaign = response.pending.find(o => o.id === timestamp)
    // campaign.id.should.equal(timestamp)
    assert.equal(campaign.id, timestamp)
    })
  })
  describe('Delete test campaign', function() {
    it('Successfully deletes test campaign', async function() {
      const options = {
        method: 'POST',
        uri: baseUrl + '/cancelPending',
        body: cancelPayload,
        json: true
      }
      const response = await rp(options)
      // response.success.should.equal(true)
      assert.equal(response.success, true)
      // response.cancelledId.should.equal(timestamp)
      assert.equal(response.cancelledId, timestamp)
    })
  })
  describe('Verify campaign was deleted', function() {
    it('Returns no campaign with test ID', async function() {
    const options = {
      method: 'GET',
      uri: baseUrl + '/pending',
      json: true
    }
    const response = await rp(options)
    assert.equal(Array.isArray(response.pending), true)
    const campaign = response.pending.find(o => o.id === timestamp)
    assert.equal(campaign, null)
    })
  })
})