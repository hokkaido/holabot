const assert = (predicate, message) => {
  if (!predicate) {
    throw new Error(message);
  }
};

const fail = (message) => assert(false, message);

module.exports = {
  assert,
  fail,
};