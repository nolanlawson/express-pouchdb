// stash any recent replications that the user has requested, so they can cancel
// them if need be

var stash = {};

// save a replicate object for later, keying it off the replicationId
// as well as the source/target
exports.stash = function (replicationId, source, target, replicate) {
  console.log('stashing replication: ' + replicationId +
    ', ' + source + ' -> ' + target);

  replicate._source = source;
  replicate._target = target;
  replicate._replicationId = replicationId;

  stash[replicationId] = replicate;
  stash[JSON.stringify([source, target])] = replicate;
  replicate.on('error', function () {
    delete stash[replicationId];
    delete stash[JSON.stringify([source, target])];
  });
  replicate.on('complete', function () {
    delete stash[replicationId];
    delete stash[JSON.stringify([source, target])];
  });
};

// there are two ways to cancel a replication - either by replication id
// or by source/target combo
exports.cancelById = function(replicationId) {
  console.log('canceling replication: ' + replicationId);
  var stashed = stash[replicationId];
  if (stashed) {
    stashed.cancel();
    delete stash[replicationId];
    delete stash[JSON.stringify([stashed._source, stashed._target])];
  }
};

exports.cancelBySourceAndTarget = function(source, target) {
  console.log('canceling replication: ' + source + ' -> ' + target);
  var stashed = stash[JSON.stringify([source, target])];
  if (stashed) {
    stashed.cancel();
    delete stash[JSON.stringify([source, target])];
    delete stash[stashed._replicationId];
  }
}