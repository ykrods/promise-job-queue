import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { Queue } from "./index.js";

function sleep(n) {
  return new Promise(resolve => setTimeout(resolve, n));
}

test("Queue.add() basis", async() => {
  const q = new Queue();

  let done = false;
  async function task() {
    await sleep(50);
    done = true;
  }

  let promise = q.add(task);
  assert.is(done, false);

  await promise;
  assert.is(done, true);
});

test("Run in serial when concurrency is 1", async() => {
  const q = new Queue();

  let count = 0;
  async function countUp() {
    await sleep(50);
    count++;
  }

  q.add(countUp);
  q.add(countUp);
  q.add(countUp);
  assert.equal(count, 0);
  await q.wait();
  assert.equal(count, 3);
});

test("Run in parallel when concurrency is 2", async() => {
  const q = new Queue(2);

  const start = new Date().getTime();

  let a = false, b = false, c = false;

  q.add(async() => {
    await sleep(50);
    a = true;
  });

  q.add(async() => {
    await sleep(50);
    b = true;
  });

  q.add(async() => {
    await sleep(50);
    c = true;
  });

  await q.wait();

  const time = (new Date().getTime() - start);
  assert.equal(a, true);
  assert.equal(b, true);
  assert.equal(c, true);
  assert.ok(100 < time && time < 140);
});

test("Queue.add() with args", async() => {
  const q = new Queue();

  async function task(a, b) {
    return a + b;
  }

  const result = await q.add(task, 1, 2);
  assert.equal(result, 3);
});

test("Error task", async() => {
  const q = new Queue();

  let done = false;

  q.add(async() => { throw "Error"; });
  q.add(async() => { done = true; });
  await q.wait();
  assert.equal(done, true);
});

test.run();
