# Parent and Child Processes in Node.js

## Parent Process vs. Child Process

### Parent Process
- The **parent process** is the main Node.js process that runs your script.
- It includes the execution of JavaScript code, I/O operations, and the management of the event loop.

### Child Process
- A **child process** is a separate process created by the parent process, typically using the `child_process` module.
- It runs independently of the parent and can execute a separate program, such as a shell command or another script.

## Your Scenario

If you're running a script that:
1. **Takes two inputs**
2. **Adds them**
3. **Outputs the result**

The process of running this script would be handled entirely by the **parent process**. No child process is involved unless you explicitly create one.

## Role of I/O in Your Script
1. **Input/Output (I/O)** operations (e.g., reading input or writing output) are **handled asynchronously** by the parent process itself using the Node.js event loop.
2. These I/O operations are **not child processes**; they are tasks that the event loop handles in different phases.

## When a Child Process Would Be Used

A **child process** might come into play if:
1. You need to offload heavy computation (e.g., processing large datasets)
2. You want to run a separate program (e.g., Python script, shell command, etc.) to perform the addition

### Example with Child Process

```javascript
const { fork } = require('child_process');

// Fork a child process to run a separate script
const child = fork('child.js'); // child.js contains the logic for addition

child.send({ num1: 5, num2: 10 }); // Send data to the child process

child.on('message', (result) => {
  console.log(`Result from child process: ${result}`);
});
```

**Child Script** (child.js):
```javascript
process.on('message', (data) => {
  const result = data.num1 + data.num2;
  process.send(result); // Send the result back to the parent
});
```

## The Event Loop's Role

### Handling User Input (I/O)

If the script is reading input from a user (e.g., via readline or stdin), the input is an **asynchronous I/O operation**.

The event loop ensures that:
- It **waits** for the input to complete without blocking other tasks
- When the input arrives, the event loop executes the associated callback function

#### Example of User Input with Event Loop:

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the first number: ", (num1) => {
  rl.question("Enter the second number: ", (num2) => {
    const sum = parseInt(num1) + parseInt(num2);
    console.log(`Sum: ${sum}`);
    rl.close();
  });
});
```

### Performing the Addition (Synchronous)
- The addition operation is a **synchronous task** executed immediately in the main thread
- No event loop intervention is needed for this simple computation

### Outputting the Result (I/O)
- Outputting the result (console.log) is a lightweight, synchronous operation
- The event loop doesn't need to manage it explicitly because it's handled immediately

## Event Loop in More Complex Scenarios

### Adding a File Read:

```javascript
const fs = require('fs');
fs.readFile('numbers.txt', 'utf8', (err, data) => {
  if (err) throw err;
  const [num1, num2] = data.split(' ').map(Number);
  console.log(`Sum: ${num1 + num2}`);
});
```

#### How the Event Loop Works:
- **File Read Request**: Delegated to the operating system by Node.js via the event loop
- The event loop continues running other tasks while waiting for the file read to complete
- Once the file read is complete, the callback is queued and executed in the **Poll Phase** of the event loop

## Summary of the Event Loop's Role
1. **Manages Asynchronous Tasks**:
   - Waits for input/output (I/O) operations like reading user input or files
   - Executes their callbacks when data is ready, ensuring the main thread remains free

2. **Prevents Blocking**:
   - Keeps the application responsive by delegating long-running I/O to the system

3. **Callback Execution**:
   - Queues callbacks and executes them in the correct phase of the event loop

In your specific scenario, the event loop ensures that I/O operations like **user input** or **reading files** are handled asynchronously, allowing the script to remain non-blocking and efficient.
---
# Threads in Node.js

Node.js plays an essential role in threading, even though most of the code is executed in a single thread due to Node.js being single-threaded in its JavaScript execution. Let's examine the role of threads in your scenario and how Node.js utilizes them internally.

## Threading in Node.js

Node.js operates with two key threading models:
1. **Main Thread (Event Loop)**: Executes JavaScript code and manages the event loop.
2. **Worker Threads (libuv thread pool)**: Handles I/O-intensive and computationally heavy tasks.

## Role of Threads in Your Scenario

Your example involves three main steps:
1. Taking user input (I/O)
2. Performing a simple addition (computation)
3. Outputting the result (I/O)

Here's how threads are involved in each step:

### 1. Taking User Input (I/O)
- When reading user input (e.g., using readline), Node.js delegates this task to the main thread (event loop), which waits for input events.
- Since user input is typically asynchronous, Node.js doesn't block the main thread while waiting. Instead:
  - The libuv thread pool may handle low-level system operations (e.g., listening to stdin events) in the background.
  - Once input is ready, the main thread (event loop) executes the callback to process the input.

### 2. Performing the Addition (Computation)
- Adding two numbers (`parseInt(num1) + parseInt(num2)`) is a synchronous computation.
- This task is lightweight and handled entirely in the main thread without offloading to worker threads.
- For heavy computations (e.g., processing large data arrays), Node.js may require Worker Threads to prevent blocking the event loop. But for simple addition, threading isn't relevant.

### 3. Outputting the Result (I/O)
- Writing to the console (via `console.log`) is handled by the main thread, but:
  - The actual output to the terminal involves asynchronous I/O operations.
  - These I/O operations may internally use threads in the libuv thread pool to manage low-level system calls for writing to stdout.

## When Threads Would Play a Bigger Role

Threads are crucial when tasks are I/O-bound or CPU-intensive:

### 1. I/O-Intensive Tasks
- Reading files from the filesystem (`fs.readFile`), making HTTP requests, or accessing databases.
- Node.js offloads these tasks to the libuv thread pool while the main thread continues processing other tasks.

Example:
```javascript
const fs = require('fs');
fs.readFile('numbers.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

**Thread Role**: The actual file reading happens in a separate thread from the libuv thread pool, and the result is passed back to the main thread for callback execution.

### 2. CPU-Intensive Tasks
- Heavy computations (e.g., calculating Fibonacci numbers or processing large datasets) would block the main thread.
- In such cases, Worker Threads can be used to handle CPU-bound tasks in parallel.

Example:
```javascript
const { Worker } = require('worker_threads');

const worker = new Worker(`
  const { parentPort } = require('worker_threads');
  parentPort.on('message', (data) => {
    parentPort.postMessage(data.num1 + data.num2);
  });
`, { eval: true });

worker.postMessage({ num1: 5, num2: 10 });
worker.on('message', (result) => {
  console.log(`Result: ${result}`);
});
```

## Thread Roles Summarized for Your Scenario

| Step | Thread Involved |
|------|-----------------|
| Reading User Input | Main thread (event loop) processes input; libuv thread pool may assist with system-level events. |
| Performing Addition | Main thread performs the computation (lightweight). |
| Writing Output | Main thread executes `console.log`; libuv thread pool may handle low-level system I/O. |

## Key Takeaways
1. In your simple scenario, most tasks are handled by the main thread because:
   - Input and output are lightweight I/O operations.
   - The addition is a simple synchronous computation.
2. Threads in the libuv thread pool are used internally for system-level I/O tasks.
3. If your program had heavier I/O or computational tasks, Node.js could:
   - Use the libuv thread pool for I/O-intensive tasks.
   - Employ Worker Threads for CPU-intensive tasks to prevent blocking the main thread.