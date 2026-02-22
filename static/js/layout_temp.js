// =========================
// Overlay + wiring
// =========================
const overlay = document.getElementById("overlay");
const layout = document.querySelector(".play-layout");
const nextStepBtn = document.getElementById("nextStepBtn");

let startNode = null;
let selectedWireGroup = null;

// Selected component (clone)
let selectedCloneEl = null;

// wireRecords: { group, aPin, bPin }
const wireRecords = [];

function resizeOverlay() {
    const box = layout.getBoundingClientRect();
    overlay.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    overlay.setAttribute("width", box.width);
    overlay.setAttribute("height", box.height);

    updateAllWires();
}
window.addEventListener("resize", resizeOverlay);
window.addEventListener("load", resizeOverlay);

// Catch layout size changes that don't trigger window.resize (e.g., responsive reflow)
const layoutResizeObserver = new ResizeObserver(() => resizeOverlay());
layoutResizeObserver.observe(layout);


function nodeCenterInLayout(el) {
    const r = el.getBoundingClientRect();
    const l = layout.getBoundingClientRect();
    return {
        x: r.left - l.left + r.width / 2,
        y: r.top - l.top + r.height / 2
    };
}


// Update wire geometry to follow pins when things move/resize
function updateWireRecord(rec) {
    if (!rec || !rec.group || !rec.aPin || !rec.bPin) return;

    const a = nodeCenterInLayout(rec.aPin);
    const b = nodeCenterInLayout(rec.bPin);

    const wire = rec.group.querySelector(".wire");
    if (wire) {
        wire.setAttribute("x1", a.x);
        wire.setAttribute("y1", a.y);
        wire.setAttribute("x2", b.x);
        wire.setAttribute("y2", b.y);
    }

    // Keep the X marker at the B end
    const size = 9;
    const xLines = rec.group.querySelectorAll(".xmark");
    if (xLines.length >= 2) {
        xLines[0].setAttribute("x1", b.x - size);
        xLines[0].setAttribute("y1", b.y - size);
        xLines[0].setAttribute("x2", b.x + size);
        xLines[0].setAttribute("y2", b.y + size);

        xLines[1].setAttribute("x1", b.x - size);
        xLines[1].setAttribute("y1", b.y + size);
        xLines[1].setAttribute("x2", b.x + size);
        xLines[1].setAttribute("y2", b.y - size);
    }
}

function updateAllWires() {
    for (const rec of wireRecords) updateWireRecord(rec);
}

function selectNode(el) {
    el.classList.add("selected");
    startNode = el;
}

function clearNodeSelection() {
    if (startNode) startNode.classList.remove("selected");
    startNode = null;
}

function clearWireSelection() {
    if (!selectedWireGroup) return;
    const wire = selectedWireGroup.querySelector(".wire");
    if (wire) wire.classList.remove("selected-wire");
    selectedWireGroup = null;
}

function selectWire(group) {
    clearCloneSelection();
    clearNodeSelection();

    clearWireSelection();
    selectedWireGroup = group;
    const wire = group.querySelector(".wire");
    if (wire) wire.classList.add("selected-wire");
}

function clearCloneSelection() {
    if (!selectedCloneEl) return;
    selectedCloneEl.classList.remove("selected-clone");
    selectedCloneEl = null;
}

function selectClone(cloneEl) {
    clearWireSelection();
    clearNodeSelection();

    clearCloneSelection();
    selectedCloneEl = cloneEl;
    cloneEl.classList.add("selected-clone");
}

function drawX(cx, cy, size = 9) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const a = document.createElementNS("http://www.w3.org/2000/svg", "line");
    a.setAttribute("x1", cx - size);
    a.setAttribute("y1", cy - size);
    a.setAttribute("x2", cx + size);
    a.setAttribute("y2", cy + size);
    a.setAttribute("class", "xmark");

    const b = document.createElementNS("http://www.w3.org/2000/svg", "line");
    b.setAttribute("x1", cx - size);
    b.setAttribute("y1", cy + size);
    b.setAttribute("x2", cx + size);
    b.setAttribute("y2", cy - size);
    b.setAttribute("class", "xmark");

    g.appendChild(a);
    g.appendChild(b);
    return g;
}

function svgWireWithX(x1, y1, x2, y2) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", "wire");

    const xg = drawX(x2, y2, 9);

    group.appendChild(line);
    group.appendChild(xg);
    overlay.appendChild(group);

    line.style.pointerEvents = "stroke";
    group.style.pointerEvents = "visibleStroke";

    group.addEventListener("click", (e) => {
        e.stopPropagation();
        selectWire(group);
    });

    return group;
}

function attachPinBehavior(pinEl) {
    pinEl.addEventListener("click", (e) => {
        e.stopPropagation();
        clearWireSelection();
        clearCloneSelection();

        if (!startNode) { selectNode(pinEl); return; }
        if (pinEl === startNode) { clearNodeSelection(); return; }

        updateAllWires();
        const a = nodeCenterInLayout(startNode);
        const b = nodeCenterInLayout(pinEl);

        const g = svgWireWithX(a.x, a.y, b.x, b.y);
        wireRecords.push({ group: g, aPin: startNode, bPin: pinEl });

        clearNodeSelection();
    });
}

document.querySelectorAll(".pin").forEach(attachPinBehavior);

layout.addEventListener("click", () => {
    clearNodeSelection();
    clearWireSelection();
    clearCloneSelection();
});

function deleteWireGroup(groupEl) {
    if (!groupEl) return;

    for (let i = wireRecords.length - 1; i >= 0; i--) {
        if (wireRecords[i].group === groupEl) wireRecords.splice(i, 1);
    }
    groupEl.remove();
    if (selectedWireGroup === groupEl) selectedWireGroup = null;
}

function deleteCloneAndItsWires(cloneEl) {
    if (!cloneEl) return;

    // Remove any wires attached to ANY comp-pin inside this clone
    const pins = Array.from(cloneEl.querySelectorAll(".comp-pin"));
    for (let i = wireRecords.length - 1; i >= 0; i--) {
        const rec = wireRecords[i];
        if (pins.includes(rec.aPin) || pins.includes(rec.bPin)) {
            // remove from DOM + remove from wireRecords
            if (rec.group) rec.group.remove();
            wireRecords.splice(i, 1);
        }
    }

    // If startNode is one of these pins, clear it
    if (startNode && pins.includes(startNode)) clearNodeSelection();

    // Remove registry entry
    const instanceName = cloneEl.dataset.instanceName;
    if (instanceName) instancesByName.delete(instanceName);

    // Clear selection if needed
    if (selectedCloneEl === cloneEl) selectedCloneEl = null;

    // Remove clone
    cloneEl.remove();

    // Refresh overlay sizing
    resizeOverlay();
}

window.addEventListener("keydown", (e) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();

    // Prefer deleting wire if a wire is selected (matches your old behavior)
    if (selectedWireGroup) {
        deleteWireGroup(selectedWireGroup);
        return;
    }

    // Otherwise delete selected clone
    if (selectedCloneEl) {
        deleteCloneAndItsWires(selectedCloneEl);
        return;
    }
});

// =========================
// Instances registry
// =========================
// instancesByName.get(name) => { typeName, pins: Map(role -> pinEl) }
const instancesByName = new Map();

function promptForUniqueName(defaultName = "Item") {
    let name = prompt("Name this item:", defaultName);
    if (name === null) return null;
    name = name.trim();

    while (name.length === 0 || instancesByName.has(name)) {
        if (name.length === 0) {
            name = prompt("Name cannot be empty. Enter a name:", defaultName);
        } else {
            name = prompt(`"${name}" already exists. Enter a unique name:`, defaultName);
        }
        if (name === null) return null;
        name = name.trim();
    }
    return name;
}

// =========================
// Helper: get "pin number" from a board pin element.
// Uses its data-name (e.g., "D13", "GND", "VIN", etc.)
// =========================
function getBoardPinNumber(pinEl) {
    return pinEl?.dataset?.name ?? null;
}

// =========================
// getPinDict() requested:
// returns: [ motorsDict, servosDict, inputsDict, ledsDict ]
//
// Each dict includes EVERY CONNECTION made with that type in the format:
//   itemName : pinNumber
//
// Motor: motorName : [pinIN1, pinIN2, pinIN3, pinIN4]
//
// Important detail:
// - "pinNumber" means the BOARD pin the component is wired to (data-name on the red board pin).
// - If a component pin is connected to multiple board pins, the latest connection wins (last drawn wire).
// - If a component pin is wired to another component pin (not a board pin), it is ignored for this dict.
// =========================
function getPinDict() {
    const motors = {};
    const servos = {};
    const inputs = {};
    const leds = {};

    // For motors we accumulate per role IN1..IN4
    // motorConnections[name] = { IN1: "D3", IN2: "D4", IN3: ..., IN4: ... }
    const motorConnections = new Map();

    // For non-motor: last board connection found
    const lastBoardConn = new Map(); // instanceName -> boardPinName (e.g. D13)

    function recordNonMotor(instanceName, boardPinName) {
        if (!boardPinName) return;
        lastBoardConn.set(instanceName, boardPinName);
    }

    function recordMotor(instanceName, role, boardPinName) {
        if (!boardPinName) return;
        if (!motorConnections.has(instanceName)) {
            motorConnections.set(instanceName, { IN1: null, IN2: null, IN3: null, IN4: null });
        }
        motorConnections.get(instanceName)[role] = boardPinName;
    }

    // Walk wireRecords in order (so "latest wins")
    for (const rec of wireRecords) {
        const a = rec.aPin;
        const b = rec.bPin;

        const aIsBoard = a?.classList?.contains("pin");
        const bIsBoard = b?.classList?.contains("pin");
        const aIsComp = a?.classList?.contains("comp-pin");
        const bIsComp = b?.classList?.contains("comp-pin");

        // Only care about component<->board connections
        if (aIsComp && bIsBoard) {
            handleCompToBoard(a, b);
        } else if (bIsComp && aIsBoard) {
            handleCompToBoard(b, a);
        }
    }

    function handleCompToBoard(compPinEl, boardPinEl) {
        const clone = compPinEl.closest(".clone");
        if (!clone) return;

        const instanceName = clone.dataset.instanceName;
        const typeName = clone.dataset.component;
        const role = compPinEl.dataset.role || "MAIN";
        const boardPinName = getBoardPinNumber(boardPinEl);

        if (!instanceName || !typeName || !boardPinName) return;

        if (typeName === "MOTOR") {
            recordMotor(instanceName, role, boardPinName);
        } else {
            recordNonMotor(instanceName, boardPinName);
        }
    }

    // Build output dicts
    for (const [instanceName, info] of instancesByName.entries()) {
        if (info.typeName === "MOTOR") {
            const c = motorConnections.get(instanceName) || { IN1: null, IN2: null, IN3: null, IN4: null };
            motors[instanceName] = [c.IN1, c.IN2, c.IN3, c.IN4];
        } else {
            const pinNum = lastBoardConn.get(instanceName) || null;
            if (info.typeName === "SERVO") servos[instanceName] = pinNum;
            else if (info.typeName === "LED") leds[instanceName] = pinNum;
            else if (info.typeName === "INPUT") inputs[instanceName] = pinNum;
        }
    }

    return [motors, servos, inputs, leds];
}

window.getPinDict = getPinDict;

// =========================
// Drag + Drop on background
// =========================
let dragPayload = null;

document.querySelectorAll(".source-item").forEach(item => {
    item.addEventListener("dragstart", (e) => {
        dragPayload = {
            component: item.dataset.component,
            src: item.dataset.src
        };
        e.dataTransfer.setData("text/plain", JSON.stringify(dragPayload));
        e.dataTransfer.effectAllowed = "copy";
    });
});

layout.addEventListener("dragover", (e) => {
    e.preventDefault();
    layout.classList.add("dragover");
    e.dataTransfer.dropEffect = "copy";
});

layout.addEventListener("dragleave", () => {
    layout.classList.remove("dragover");
});

layout.addEventListener("drop", (e) => {
    e.preventDefault();
    layout.classList.remove("dragover");

    let data = null;
    try {
        data = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
        data = dragPayload;
    }
    if (!data || !data.src) return;

    const instanceName = promptForUniqueName(data.component);
    if (instanceName === null) return;

    const layoutRect = layout.getBoundingClientRect();
    const x = e.clientX - layoutRect.left;
    const y = e.clientY - layoutRect.top;

    createCloneOnBackground(instanceName, data.component, data.src, x, y);
    resizeOverlay();
});

function createMotorPins(cloneEl, instanceName) {
    const roles = ["IN1", "IN2", "IN3", "IN4"];
    const pinMap = new Map();

    for (const role of roles) {
        const pin = document.createElement("div");
        pin.className = "comp-pin";
        pin.dataset.role = role;
        // unique data-name (component-side)
        pin.dataset.name = `${instanceName}:${role}`;

        const tag = document.createElement("div");
        tag.className = "pin-tag";
        tag.textContent = role;

        // Align tags with the new vertical line layout on the left
        const topMap = { IN1: "22%", IN2: "40%", IN3: "58%", IN4: "76%" };
        tag.style.left = "22%";          // slightly to the right of the pin
        tag.style.top = topMap[role];
        tag.style.transform = "translate(-50%, -50%)";

        cloneEl.appendChild(pin);
        cloneEl.appendChild(tag);

        attachPinBehavior(pin);
        pinMap.set(role, pin);
    }

    return pinMap;
}

function createCloneOnBackground(instanceName, typeName, src, x, y) {
    const clone = document.createElement("div");
    clone.className = "clone";
    clone.dataset.component = typeName;
    clone.dataset.instanceName = instanceName;

    // add type class for CSS pin placement rules
    clone.classList.add(typeName.toLowerCase());
    if (typeName === "MOTOR") clone.classList.add("motor"); // keep existing motor class too

    const W = 150, H = 150;
    clone.style.left = `${x - W / 2}px`;
    clone.style.top = `${y - H / 2}px`;

    const img = document.createElement("img");
    img.src = src;
    img.alt = typeName;
    clone.appendChild(img);

    let pins = new Map();

    if (typeName === "MOTOR") {
        pins = createMotorPins(clone, instanceName);
    } else {
        const pin = document.createElement("div");
        pin.className = "comp-pin";
        pin.dataset.role = "MAIN";
        pin.dataset.name = `${instanceName}:MAIN`;
        clone.appendChild(pin);

        attachPinBehavior(pin);
        pins.set("MAIN", pin);
    }

    const label = document.createElement("div");
    label.className = "clone-label";
    label.textContent = instanceName;
    clone.appendChild(label);

    // Click to select clone (for Backspace delete)
    clone.addEventListener("click", (e) => {
        // If they clicked a pin, pin handler already runs and stops propagation
        e.stopPropagation();
        selectClone(clone);
    });

    layout.appendChild(clone);

    instancesByName.set(instanceName, { typeName, pins });

    makeCloneMovable(clone);
    return clone;
}

function makeCloneMovable(cloneEl) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    cloneEl.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("comp-pin")) return;

        isDragging = true;
        const rect = cloneEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        cloneEl.style.cursor = "grabbing";
        e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const layoutRect = layout.getBoundingClientRect();
        const x = e.clientX - layoutRect.left - offsetX;
        const y = e.clientY - layoutRect.top - offsetY;

        const maxX = layout.clientWidth - cloneEl.offsetWidth;
        const maxY = layout.clientHeight - cloneEl.offsetHeight;

        cloneEl.style.left = `${Math.min(Math.max(0, x), Math.max(0, maxX))}px`;
        cloneEl.style.top = `${Math.min(Math.max(0, y), Math.max(0, maxY))}px`;

        updateAllWires();
    });

    window.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        cloneEl.style.cursor = "move";
    });
}

// =========================
// Next Step
// =========================
nextStepBtn.addEventListener("click", () => {
    const payload = getPinDict();
    console.log("Pin dict payload:", payload);

    try {
        localStorage.setItem("itch_pin_dict", JSON.stringify(payload));
        window.location.href = "/editor";
    } catch {
        alert("Failure Somewhere");
    }
});