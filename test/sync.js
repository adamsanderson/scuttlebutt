//need a stream that ends after it has syncronized two scuttlebutts.

var EE = require('../events')
var assert = require('assert')
var es = require('event-stream')
var mac = require('macgyver')()
process.on('exit', mac.validate)

var a = new EE()
var b = new EE()
var synced = false
var as = a.createStream({end: true, wrapper: 'json', name: 'a'})
var bs = b.createStream({end: true, wrapper: 'json', name: 'b'})

as.on('synced', mac(function () {
  console.log('A SYNC!')
  synced = true
  assert.deepEqual(a.history(), b.history())
 }).once())

bs.on('synced', mac(function () {
  console.log('B SYNC!')
  next(function () {
    assert.deepEqual(a.history(), b.history())
  })
 }).once())

as.on('end', function () {
  console.log('A.END()')
})

bs.on('end', function () {
  console.log('B.END()')
})


a.emit('event', 1)
a.emit('event', 2)
a.emit('event', 3)

b.emit('event', 4)
b.emit('event', 5)
b.emit('event', 6)

assert.equal(synced, false)

as.pipe(es.log('AB>')).pipe(bs).pipe(es.log('BA>')).pipe(as)

var next = process.nextTick

next(function () {

  console.log(a.history())
  console.log(b.history())

  assert.deepEqual(a.history(), b.history())

})
