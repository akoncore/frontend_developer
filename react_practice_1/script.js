"use strict";

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const rand = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- 1. Closure: createTask ---------- */
function createTask(name, onChange = () => {}) {
  let count = 0;          // private
  let status = "Idle";    // private
  let time = null;        // private
  const emit = () => onChange({ name, status, count, time });

  async function run() {
    count++;
    status = "Loading";
    time = null;
    emit();
    const start = performance.now();
    const delay = rand(500, 2000); // random 500-2000 ms
    try {
      // Promise + setTimeout simulate loading; 30% of the time it fails
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() < 0.3 ? reject(new Error(`${name} failed`)) : resolve();
        }, delay);
      });
      status = "Completed";
    } catch (err) {
      status = "Failed";
      throw err; // the caller decides how to handle the error
    } finally {
      time = Math.round(performance.now() - start);
      emit();
    }
  }

  function reset() { count = 0; status = "Idle"; time = null; emit(); }
  return { name, run, getCount: () => count, reset };
}

/* ---------- 2. Build the UI for tasks ---------- */
const list = $("tasks");
const tasks = ["Load Users", "Load Posts", "Load Comments"].map((name) => {
  const li = document.createElement("li");
  li.className = "task";
  li.innerHTML = `<span class="name">${name}</span><span class="badge"></span>
    <span class="count meta"></span><span class="time meta"></span>
    <span class="buttons"><button class="run">Run</button><button class="reset">Reset</button></span>`;
  list.appendChild(li);

  const task = createTask(name, ({ status, count, time }) => {
    li.dataset.status = status;
    li.querySelector(".badge").textContent = status;
    li.querySelector(".count").textContent = `Runs: ${count}`;
    li.querySelector(".time").textContent = time === null ? "Time: -" : `Time: ${time} ms`;
  });
  task.reset(); // draw the initial state

  li.querySelector(".run").onclick = () => task.run().catch(() => {}); // error is already shown in the UI
  li.querySelector(".reset").onclick = () => task.reset();
  return task;
});

const allButtons = () => document.querySelectorAll("button");
const setBusy = (busy) => allButtons().forEach((b) => (b.disabled = busy));

/* ---------- 3. Run All: concurrent, waits for every task ---------- */
async function runAll() {
  setBusy(true);
  $("summary").textContent = "Running all tasks...";
  // allSettled never rejects: it waits until EVERY promise is completed or failed
  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  const failed = results.filter((r) => r.status === "rejected").length;
  $("summary").textContent = `All tasks finished (${results.length - failed} completed, ${failed} failed)`;
  setBusy(false);
}

/* ---------- 4. Sequential vs concurrent ---------- */
async function compare() {
  setBusy(true);
  $("compare-result").textContent = "Measuring...";

  const t0 = performance.now();
  for (const t of tasks) {
    try { await t.run(); } catch { /* keep going after a failure */ }
  }
  const sequential = Math.round(performance.now() - t0);

  const t1 = performance.now();
  await Promise.allSettled(tasks.map((t) => t.run()));
  const concurrent = Math.round(performance.now() - t1);

  $("compare-result").innerHTML =
    `<b>Sequential:</b> ${sequential} ms (about the sum of all task times)<br>` +
    `<b>Concurrent:</b> ${concurrent} ms (about the slowest task)`;
  $("summary").textContent = "Comparison finished.";
  setBusy(false);
}

/* ---------- 5. Event Loop demo ---------- */
// Written BEFORE running the demo (my prediction):
const EXPECTED = [
  "script start",
  "async function start",
  "script end",
  "promise 1",
  "async function after await",
  "promise 2",
  "timer 1 (0 ms)",
  "timer 2 (10 ms)",
  "microtask created inside timer 2",
];

function eventLoopDemo(log) {
  return new Promise((done) => {
    log("script start");                                   // sync: Call Stack

    setTimeout(() => log("timer 1 (0 ms)"), 0);            // Task Queue
    setTimeout(() => {                                     // Task Queue
      log("timer 2 (10 ms)");
      Promise.resolve().then(() => log("microtask created inside timer 2")); // Microtask Queue
    }, 10);

    Promise.resolve()
      .then(() => log("promise 1"))                        // Microtask Queue
      .then(() => log("promise 2"));                       // queued after promise 1 finishes

    (async function main() {
      log("async function start");                         // runs synchronously
      await null;                                          // the rest becomes a microtask
      log("async function after await");
    })();

    log("script end");                                     // sync: Call Stack
    setTimeout(done, 50);                                  // finish the demo
  });
}

function renderList(ol, items, expected = null) {
  ol.innerHTML = "";
  items.forEach((text, i) => {
    const li = document.createElement("li");
    li.textContent = text;
    if (expected && expected[i] !== text) li.className = "miss";
    ol.appendChild(li);
  });
}

async function runDemo() {
  setBusy(true);
  const actual = [];
  await eventLoopDemo((msg) => { actual.push(msg); console.log(msg); });
  renderList($("actual"), actual, EXPECTED);
  const same = actual.length === EXPECTED.length && actual.every((m, i) => m === EXPECTED[i]);
  $("demo-verdict").textContent = same
    ? "Actual output matches the prediction."
    : "Actual output differs from the prediction (red lines).";
  setBusy(false);
}

/* ---------- Wire up ---------- */
renderList($("expected"), EXPECTED);
$("run-all").onclick = runAll;
$("compare").onclick = compare;
$("demo").onclick = runDemo;