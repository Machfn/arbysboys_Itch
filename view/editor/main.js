/* ───────── CONFIG ───────── */

// Pull from local storage
let lS = localStorage.getItem("itch_pin_dict");
if (lS == null) window.alert("No Previous Setup");
let pin_json = JSON.parse(lS);

const SERVOS = pin_json[1];
// const SERVO_PINS = {"arm" : 0, "camera" : 1}
const MOTORS = pin_json[0];
const SIMPLE_OUTPUTS = pin_json[3]
const OUTPUT_DEVICES = pin_json[2];
const VARIABLES = [];

const workspace = document.getElementById("workspace");

const options = arr => arr.map(v => `<option>${v}</option>`).join("");

/* ───────── Drag & Drop ───────── */
function makeDraggable(el) {
  el.draggable = true;
  el.addEventListener("dragstart", () => el.classList.add("dragging"));
  el.addEventListener("dragend", () => el.classList.remove("dragging"));
}

function enableDrop(zone) {
  zone.addEventListener("dragover", e => {
    e.preventDefault();
    const d = document.querySelector(".dragging");
    if (!d) return;
    const after = [...zone.children].find(c => {
      const r = c.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2;
    });
    after ? zone.insertBefore(d, after) : zone.appendChild(d);
  });
}

enableDrop(workspace);

/* ───────── Toolbars ───────── */
function childToolbar(target) {
  const t = document.createElement("div");
  t.className = "toolbar";

  const add = (txt, fn) => {
    const b = document.createElement("button");
    b.className = "small";
    b.textContent = txt;
    b.onclick = () => fn(target);
    t.appendChild(b);
  };

  add("🦾", addServo);
  add("⚙", addMotor);
  add("📤", addOutput);
  add("🔁", addLoop);
  add("❓", addIf);
  add("💡", addPin)

  return t;
}

/* ───────── Basic Blocks ───────── */
function blockBase() {
  const b = document.createElement("div");
  b.className = "block";
  makeDraggable(b);
  return b;
}

function makeVariable(p) {
  const b = blockBase();
  b.classList.add("mvar");
  let var_name = prompt("Var name");
  VARIABLES.push(var_name);
  b.innerHTML = `<strong>Make Variable: <span class="name">${var_name}</span></strong>
  <button class="danger">✖</button>`;
  b.querySelector(".danger").onclick = () => b.remove();
  p.appendChild(b);
}

function addVariable(p) {
  const b = blockBase();
  b.classList.add("var");
  b.innerHTML = `<strong>Set</strong>
    <select class="name">${options(VARIABLES)}</select>
    =
    <input type="number" class="value">
    <button class="danger">✖</button>`;
  b.querySelector(".danger").onclick = () => b.remove();
  p.appendChild(b);
}

function addServo(p) {
  const b = blockBase();
  b.classList.add("servo");
  b.innerHTML = `<strong>Servo</strong>
    <select class="name">${options(Object.keys(SERVOS))}</select>
    deg <input type="number" class="deg" size="4">
    <button class="danger">✖</button>`;
  b.querySelector(".danger").onclick = () => b.remove();
  p.appendChild(b);
}

function addMotor(p) {
  const b = blockBase();
  b.classList.add("motor")
  b.innerHTML = `<strong>Motor</strong>
    <select class="name">${options(Object.keys(MOTORS))}</select>
    <select class="state"><option>on</option><option>off</option></select>
    <button class="danger">✖</button>`;
  b.querySelector(".danger").onclick = () => b.remove();
  p.appendChild(b);
}

let addPin = (p) => {
    const b = blockBase();
    b.classList.add("pin");
    b.innerHTML = `<strong>Pin Output</strong>
        <select class="name">${options(Object.keys(SIMPLE_OUTPUTS))}</select>
        →
        <select class="state"><option>on</option><option>off</option></select>
        <button class="danger">✖</button>`;
    b.querySelector(".danger").onclick = () => b.remove();
    p.appendChild(b);

}

function addOutput(p) {
  const b = blockBase();
  b.classList.add("output");
  b.innerHTML = `<strong>Output</strong>
    <select class="dev">${options(Object.keys(OUTPUT_DEVICES))}</select>
    →
    <select class="var">${options(VARIABLES)}</select>
    <button class="danger">✖</button>`;
  b.querySelector(".danger").onclick = () => b.remove();
  p.appendChild(b);
}

/* ───────── Loop ───────── */
function addLoop(p) {
  const b = blockBase();
  b.classList.add("loop");

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `<strong>Repeat</strong>
    <input class="times">
    <button class="danger">✖</button>`;
  header.querySelector(".danger").onclick = () => b.remove();

  const children = document.createElement("div");
  children.className = "children";
  enableDrop(children);

  b.appendChild(header);
  b.appendChild(childToolbar(children));
  b.appendChild(children);

  p.appendChild(b);
}

/* ───────── IF / ELSE (FIXED) ───────── */
function addIf(p) {
  const b = blockBase();
  b.classList.add("if");

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `<strong>If</strong>
    <input class="cond">
    <button class="danger">✖</button>`;
  header.querySelector(".danger").onclick = () => b.remove();

  const thenLabel = document.createElement("strong");
  thenLabel.textContent = "Then";

  const thenC = document.createElement("div");
  thenC.className = "children then";
  enableDrop(thenC);

  const elseLabel = document.createElement("strong");
  elseLabel.textContent = "Else";

  const elseC = document.createElement("div");
  elseC.className = "children else";
  enableDrop(elseC);

  b.appendChild(header);
  b.appendChild(thenLabel);
  b.appendChild(childToolbar(thenC));
  b.appendChild(thenC);
  b.appendChild(elseLabel);
  b.appendChild(childToolbar(elseC));
  b.appendChild(elseC);

  p.appendChild(b);
}

function parse(container) {
  return Array.from(container.children).map(b => {
    if (b.classList.contains("loop")) {
      return {
        type: "loop",
        times: b.querySelector(".times").value,
        children: parse(b.querySelector(".children"))
      };
    } else if (b.classList.contains("if")) {
      return {
        type: "if",
        condition: b.querySelector(".condition").value,
        then: parse(b.querySelector(".then")),
        else: parse(b.querySelector(".else"))
      };
    } else if (b.classList.contains("servo")) { //b.querySelector(".mode")
      return {
        type: "servo",
        pin: SERVOS[b.querySelector(".name").value],
        angle: b.querySelector(".deg").value
      };
    } else if (b.classList.contains("motor")) { //b.querySelector(".pin") && b.querySelector(".value")
      return {
        type: "motor",
        pin: MOTORS[b.querySelector(".name").value],
        value: b.querySelector(".state").value
      };
    } else if (b.classList.contains("var")) {
        return {
            type: "set_variable",
            name: b.querySelector(".name").value,
            value: b.querySelector(".value").value
        };
    } else if (b.classList.contains("output")) {
        return {
            type: "output",
            to_var : b.querySelector(".var").value,
            from_pin: OUTPUT_DEVICES[b.querySelector(".dev").value]
        }
    } else if (b.classList.contains("pin")) {
        return {
            type: "pin_write",
            pin: SIMPLE_OUTPUTS[b.querySelector(".name").value],
            value:b.querySelector(".state").value
        }
    } else if (b.classList.contains("mvar")) {
      return {
        type: "define_variable",
        name: b.querySelector(".name").innerHTML
      }
    }
  });
}

function exportJSON() {
    // document.getElementById("output").textContent = JSON.stringify(parse(workspace), null, 2);
    console.log(JSON.stringify(parse(workspace)));
}