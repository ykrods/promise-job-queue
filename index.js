class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export class Queue {
  constructor(concurrency=1) {
    this.concurrency = concurrency;
    this._queue = [];
    this._workerCount = 0;
  }

  add(fn, ...args) {
    const deferred = new Deferred();
    this._queue.push({ fn, args, deferred });

    if (this._workerCount < this.concurrency) {
      this._kick();
    }
    return deferred.promise;
  }

  async _kick() {
    if (this._queue.length === 0) {
      return;
    }

    this._workerCount++;

    const { fn, args, deferred } = this._queue.shift();

    try {
      const result = await fn(...args);
      deferred.resolve(result);
    } catch (error) {
      // XXX: Which is preferred?
      //      (since queue.add didn't fail, it doesn't feel right to reject it)
      // deferred.reject(error);
      deferred.resolve(error);
    } finally {
      this._workerCount--;
      this._kick();
    };
  }
  /**
   * wait until all queued items have been settled
   */
  async wait() {
    return Promise.allSettled(this._queue.map(q => q.deferred.promise));
  }
}
