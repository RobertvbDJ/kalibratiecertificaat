const linearityRows = 15;
const eccentricityRows = [
  "1 (Linksboven)",
  "2 (Rechtsboven)",
  "3 (Linksonder)",
  "4 (Rechtsonder)"
];
const repeatabilityRows = ["Weging 1", "Weging 2", "Weging 3", "Weging 4"];
const storageKey = "de-jong-kalibratiecertificaat-v1";

const form = document.querySelector("#certificateForm");
const linearityEditor = document.querySelector("#linearityEditor");
const linearityPreview = document.querySelector("#linearityPreview");
const eccentricityEditor = document.querySelector("#eccentricityEditor");
const eccentricityPreview = document.querySelector("#eccentricityPreview");
const repeatabilityEditor = document.querySelector("#repeatabilityEditor");
const repeatabilityPreview = document.querySelector("#repeatabilityPreview");

const fallbackValues = {
  clientName: "[Naam]",
  clientAddress: "[Adres]",
  clientCity: "[Postcode / plaats]",
  reference: "26-xxxx",
  brand: "[Merk]",
  type: "[Type]",
  serial: "[Serie]",
  className: "III",
  eValue: "[e]",
  dValue: "[d]",
  certificateNumber: "[Nummer]",
  place: "Hengelo",
  technician: "[Naam]",
  conclusionStatus: "Akkoord",
  eccentricLoad: "[Testlast]",
  repeatLoad: "ca. 80% van Max.",
  technicianNotes: ""
};

function todayIso() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function displayDate(value) {
  if (!value) return "[Datum]";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}

function sentenceCase(value) {
  if (!value) return value;
  const lower = value.toLocaleLowerCase("nl-NL");
  return lower.charAt(0).toLocaleUpperCase("nl-NL") + lower.slice(1);
}

function makeInput(name, placeholder = "", value = "") {
  const input = document.createElement("input");
  input.name = name;
  input.placeholder = placeholder;
  input.value = value;
  input.inputMode = "decimal";
  return input;
}

function buildEditors() {
  for (let index = 1; index <= linearityRows; index += 1) {
    const row = document.createElement("div");
    row.className = "linearity-row";
    const number = document.createElement("span");
    number.textContent = index;
    row.append(
      number,
      makeInput(`linearity_${index}_load`, "Testlast"),
      makeInput(`linearity_${index}_deviation`, "Afw."),
      makeInput(`linearity_${index}_mtf`, "MTF")
    );
    linearityEditor.append(row);
  }

  eccentricityRows.forEach((label, index) => {
    const field = document.createElement("label");
    field.textContent = label;
    field.append(makeInput(`eccentricity_${index + 1}`, "Afwijking (g)"));
    eccentricityEditor.append(field);
  });

  repeatabilityRows.forEach((label, index) => {
    const field = document.createElement("label");
    field.textContent = label;
    field.append(makeInput(`repeatability_${index + 1}`, "Aanwijzing (g)"));
    repeatabilityEditor.append(field);
  });
}

function valueFor(name) {
  const field = form.elements[name];
  const raw = field ? field.value.trim() : "";
  return raw || fallbackValues[name] || "";
}

function setOutput(name, value) {
  document.querySelectorAll(`[data-out="${name}"]`).forEach((target) => {
    target.textContent = value;
  });
}

function renderLinearity() {
  linearityPreview.replaceChildren();
  for (let index = 1; index <= linearityRows; index += 1) {
    const row = document.createElement("tr");
    const defaults =
      index === 1
        ? ["0,000", "0", "..."]
        : index === 15
          ? ["[Max]", "", "..."]
          : ["", "", ""];
    const values = [
      index,
      valueFor(`linearity_${index}_load`) || defaults[0],
      valueFor(`linearity_${index}_deviation`) || defaults[1],
      valueFor(`linearity_${index}_mtf`) || defaults[2]
    ];
    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });
    linearityPreview.append(row);
  }
}

function renderSimpleTable(preview, rows, namePrefix) {
  preview.replaceChildren();
  rows.forEach((label, index) => {
    const row = document.createElement("tr");
    [label, valueFor(`${namePrefix}_${index + 1}`)].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });
    preview.append(row);
  });
}

function serialize() {
  return Object.fromEntries(new FormData(form).entries());
}

function restore(data) {
  Object.entries(data).forEach(([name, value]) => {
    if (form.elements[name]) form.elements[name].value = value;
  });
}

function render() {
  Object.keys(fallbackValues).forEach((name) => setOutput(name, valueFor(name)));
  setOutput("conclusionStatus", sentenceCase(valueFor("conclusionStatus")));
  setOutput("dateText", displayDate(valueFor("date")));
  renderLinearity();
  renderSimpleTable(eccentricityPreview, eccentricityRows, "eccentricity");
  renderSimpleTable(repeatabilityPreview, repeatabilityRows, "repeatability");
  localStorage.setItem(storageKey, JSON.stringify(serialize()));
}

function resetForm() {
  if (!confirm("Wilt u een nieuw formulier starten? Alle niet-opgeslagen wijzigingen gaan verloren.")) return;
  form.reset();
  form.elements.date.value = todayIso();
  render();
}

function saveToLibrary() {
  const data = serialize();
  const filename = `${valueFor("clientName")} - ${valueFor("certificateNumber")}.json`.replace(/[/\\?%*:|"<>]/g, "-");
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function loadFromLibrary() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        restore(data);
        render();
      } catch (err) {
        alert("Fout bij het laden van het bestand. Zorg dat het een geldig JSON-bestand is.");
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

buildEditors();
form.elements.date.value = todayIso();

const saved = localStorage.getItem(storageKey);
if (saved) {
  try {
    restore(JSON.parse(saved));
  } catch {
    localStorage.removeItem(storageKey);
  }
}

form.addEventListener("input", render);
form.addEventListener("change", render);
document.querySelector("#printButton").addEventListener("click", () => window.print());
document.querySelector("#printButtonBottom").addEventListener("click", () => window.print());
document.querySelector("#saveButton").addEventListener("click", saveToLibrary);
document.querySelector("#loadButton").addEventListener("click", loadFromLibrary);
document.querySelector("#resetButton").addEventListener("click", resetForm);
document.querySelector("#clearLinearity").addEventListener("click", () => {
  for (let index = 1; index <= linearityRows; index += 1) {
    ["load", "deviation", "mtf"].forEach((field) => {
      form.elements[`linearity_${index}_${field}`].value = "";
    });
  }
  render();
});

render();
