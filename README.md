# promise-job-queue
[ES Module] Simple promise-based job queue

## Example

```javascript
import { Queue } from "promise-job-queue";

const q = new Queue(); // default concurrency is 1

async function mytask(a, b) {
    return a + b;
}

q.add(mytask, 1, 2);
q.add(mytask, 2, 3);
q.add(mytask, 3, 4);

// Retrive result
const result = await q.add(mytask, 1, 1);
```
