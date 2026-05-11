const STORAGE_KEY = "oc-manager.characters.v2";
const OLD_STORAGE_KEY = "oc-manager.characters.v1";
const THEME_KEY = "oc-manager.theme";
const DEFAULT_IMAGE_COLOR = "#171b1f";

const basicFields = [
  { key: "name", label: "名前", size: "wide" },
  { key: "furigana", label: "ふりがな", size: "wide" },
  { key: "job", label: "職業", size: "compact" },
  { key: "age", label: "年齢", size: "compact" },
  { key: "gender", label: "性別", size: "compact" },
  { key: "height", label: "身長", size: "compact" },
  { key: "weight", label: "体重", size: "compact" },
  { key: "birthplace", label: "出身", size: "compact" },
  { key: "hairColor", label: "髪色", size: "compact" },
  { key: "eyeColor", label: "瞳の色", size: "compact" }
];

const questions = [
  "好きな食べ物は？",
  "苦手なものは？",
  "朝起きて最初にすることは？",
  "大切にしている持ち物は？",
  "人に言えない癖は？",
  "得意なことは？",
  "弱点やコンプレックスは？",
  "休日はどこで過ごす？",
  "怒るとどうなる？",
  "喜ぶとどんな表情をする？",
  "初対面の人にどう接する？",
  "秘密にしている過去は？",
  "よく使う口癖は？",
  "好きな色や香りは？",
  "一番怖いものは？",
  "誰にも譲れない信念は？",
  "戦うならどんな戦い方をする？",
  "落ち込んだ時に頼るものは？",
  "部屋には何が置いてある？",
  "夢や目標は？"
];

const randomGroups = [
  {
    title: "過去",
    categories: ["幼少期", "学生時代", "転機", "忘れられない出来事", "隠している過去"]
  },
  {
    title: "持ち物",
    categories: ["大切なもの", "普段持ち歩くもの", "武器や道具", "もらいもの", "なくしたもの"]
  },
  {
    title: "性格",
    categories: ["長所", "短所", "癖", "怒り方", "喜び方"]
  },
  {
    title: "人間関係",
    categories: ["家族", "親友", "ライバル", "苦手な相手", "恩人"]
  },
  {
    title: "生活",
    categories: ["朝の習慣", "部屋", "休日", "食事", "仕事中の様子"]
  },
  {
    title: "能力",
    categories: ["得意なこと", "苦手なこと", "戦い方", "才能", "弱点"]
  },
  {
    title: "価値観",
    categories: ["信念", "許せないこと", "大切な約束", "怖いもの", "夢"]
  }
];

function createCharacter(name = "新しいキャラ") {
  return {
    id: crypto.randomUUID(),
    basics: {
      name,
      furigana: "",
      job: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      birthplace: "",
      hairColor: "",
      eyeColor: ""
    },
    image: "",
    imageColor: DEFAULT_IMAGE_COLOR,
    customBasics: [],
    fieldGroups: [],
    looseFields: []
  };
}

let characters = loadCharacters();
let currentId = characters[0].id;

const characterSelect = document.querySelector("#characterSelect");
const helpBtn = document.querySelector("#helpBtn");
const helpModal = document.querySelector("#helpModal");
const closeHelpBtn = document.querySelector("#closeHelpBtn");
const addCharacterBtn = document.querySelector("#addCharacterBtn");
const deleteCharacterBtn = document.querySelector("#deleteCharacterBtn");
const addBasicFieldBtn = document.querySelector("#addBasicFieldBtn");
const imageColorInput = document.querySelector("#imageColorInput");
const exportBtn = document.querySelector("#exportBtn");
const importInput = document.querySelector("#importInput");
const lightThemeBtn = document.querySelector("#lightThemeBtn");
const darkThemeBtn = document.querySelector("#darkThemeBtn");
const basicGrid = document.querySelector("#basicGrid");
const portraitInput = document.querySelector("#portraitInput");
const portraitPreview = document.querySelector("#portraitPreview");
const portraitFrame = document.querySelector(".portrait-frame");
const fieldsList = document.querySelector("#fieldsList");
const fieldModal = document.querySelector("#fieldModal");
const fieldForm = document.querySelector("#fieldForm");
const openFieldModalBtn = document.querySelector("#openFieldModalBtn");
const closeFieldModalBtn = document.querySelector("#closeFieldModalBtn");
const cancelFieldBtn = document.querySelector("#cancelFieldBtn");
const randomQuestionBtn = document.querySelector("#randomQuestionBtn");
const randomGroupBtn = document.querySelector("#randomGroupBtn");
const groupInfoBtn = document.querySelector("#groupInfoBtn");
const categoryInfoBtn = document.querySelector("#categoryInfoBtn");
const randomQuestion = document.querySelector("#randomQuestion");
const fieldGroup = document.querySelector("#fieldGroup");
const groupOptions = document.querySelector("#groupOptions");
const modalItems = document.querySelector("#modalItems");
const addModalItemBtn = document.querySelector("#addModalItemBtn");

function normalizeCharacter(character) {
  const normalized = createCharacter(character?.name || character?.basics?.name || "新しいキャラ");
  normalized.id = character?.id || normalized.id;
  normalized.image = character?.image || "";
  normalized.imageColor = character?.imageColor || DEFAULT_IMAGE_COLOR;
  normalized.customBasics = Array.isArray(character?.customBasics)
    ? character.customBasics.map((field) => ({
        id: field?.id || crypto.randomUUID(),
        label: field?.label || "項目",
        value: field?.value || ""
      }))
    : [];
  normalized.fieldGroups = normalizeFieldGroups(character);
  normalized.looseFields = Array.isArray(character?.looseFields)
    ? character.looseFields.map(normalizeField)
    : [];
  normalized.basics = {
    ...normalized.basics,
    ...(character?.basics || {}),
    name: character?.basics?.name || character?.name || normalized.basics.name,
    gender: character?.basics?.gender || character?.gender || normalized.basics.gender
  };
  return normalized;
}

function normalizeField(field) {
  return {
    id: field?.id || crypto.randomUUID(),
    category: field?.category || "",
    value: field?.value || "",
    image: field?.image || ""
  };
}

function normalizeFieldGroups(character) {
  if (Array.isArray(character?.fieldGroups)) {
    return character.fieldGroups.map((group) => ({
      id: group.id || crypto.randomUUID(),
      title: group.title || "追加情報",
      fields: Array.isArray(group.fields)
        ? group.fields.map(normalizeField)
        : []
    }));
  }

  if (Array.isArray(character?.fields) && character.fields.length) {
    return [
      {
        id: crypto.randomUUID(),
        title: "追加情報",
        fields: character.fields.map(normalizeField)
      }
    ];
  }

  return [];
}

function loadCharacters() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved.map(normalizeCharacter);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  try {
    const oldSaved = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
    if (Array.isArray(oldSaved) && oldSaved.length) {
      const migrated = oldSaved.map(normalizeCharacter);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    localStorage.removeItem(OLD_STORAGE_KEY);
  }

  return [createCharacter()];
}

function saveCharacters() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function createBackupData() {
  return {
    app: "oc-manager",
    version: 2,
    exportedAt: new Date().toISOString(),
    characters
  };
}

function downloadJsonBackup() {
  const data = JSON.stringify(createBackupData(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `oc-manager-backup-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importJsonBackup(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const json = JSON.parse(String(reader.result));
      const importedCharacters = Array.isArray(json) ? json : json.characters;
      if (!Array.isArray(importedCharacters) || !importedCharacters.length) {
        alert("読み込めるキャラデータが見つかりませんでした。");
        return;
      }

      const ok = confirm("現在の保存データを、JSONの内容で置き換えますか？");
      if (!ok) return;

      characters = importedCharacters.map(normalizeCharacter);
      currentId = characters[0].id;
      saveCharacters();
      render();
      alert("バックアップを読み込みました。");
    } catch {
      alert("JSONファイルを読み込めませんでした。");
    } finally {
      importInput.value = "";
    }
  });
  reader.readAsText(file);
}

function currentCharacter() {
  return characters.find((character) => character.id === currentId) || characters[0];
}

function characterDisplayName(character) {
  return character.basics.name.trim() || "名前未設定";
}

function renderCharacterOptions() {
  const selected = currentId;
  characterSelect.innerHTML = "";
  characters.forEach((character) => {
    const option = document.createElement("option");
    option.value = character.id;
    option.textContent = characterDisplayName(character);
    characterSelect.append(option);
  });
  characterSelect.value = selected;
}

function renderBasics(character) {
  basicGrid.innerHTML = "";
  basicFields.forEach((field) => {
    const label = document.createElement("label");
    label.className = `basic-field ${field.size}`;

    const title = document.createElement("span");
    title.textContent = field.label;

    const input = document.createElement("input");
    input.value = character.basics[field.key] || "";
    input.placeholder = field.label;
    input.addEventListener("input", () => {
      character.basics[field.key] = input.value;
      saveCharacters();
      if (field.key === "name") renderCharacterOptions();
    });

    label.append(title, input);
    basicGrid.append(label);
  });

  character.customBasics.forEach((field) => {
    basicGrid.append(createCustomBasicField(field));
  });
}

function createCustomBasicField(field) {
  const row = document.createElement("label");
  row.className = "basic-field custom compact";

  const titleInput = document.createElement("input");
  titleInput.className = "basic-label-input";
  titleInput.value = field.label;
  titleInput.placeholder = "項目";
  titleInput.addEventListener("input", () => {
    field.label = titleInput.value;
    saveCharacters();
  });

  const valueInput = document.createElement("input");
  valueInput.value = field.value;
  valueInput.placeholder = "内容";
  valueInput.addEventListener("input", () => {
    field.value = valueInput.value;
    saveCharacters();
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-basic-field";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", `${field.label || "基本情報"}を削除`);
  deleteButton.addEventListener("click", (event) => {
    event.preventDefault();
    const character = currentCharacter();
    character.customBasics = character.customBasics.filter((item) => item.id !== field.id);
    saveCharacters();
    render();
  });

  row.append(titleInput, valueInput, deleteButton);
  return row;
}

function render() {
  const character = currentCharacter();
  currentId = character.id;

  renderCharacterOptions();
  applyImageColor(character.imageColor);
  renderBasics(character);

  if (character.image) {
    portraitPreview.src = character.image;
    portraitFrame.classList.add("has-image");
  } else {
    portraitPreview.removeAttribute("src");
    portraitFrame.classList.remove("has-image");
  }

  fieldsList.innerHTML = "";
  if (!character.fieldGroups.length && !character.looseFields.length) {
    fieldsList.hidden = true;
  } else {
    fieldsList.hidden = false;
    character.looseFields.forEach((field) => {
      fieldsList.append(createLooseFieldCard(field));
    });
    character.fieldGroups.forEach((group) => {
      fieldsList.append(createFieldGroup(group));
    });
  }

  deleteCharacterBtn.disabled = characters.length <= 1;
}

function applyImageColor(color) {
  const value = /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_IMAGE_COLOR;
  document.body.style.setProperty("--character-color", value);
  imageColorInput.value = value;
}

function createFieldGroup(group) {
  const section = document.createElement("section");
  section.className = "field-group";
  section.dataset.id = group.id;

  const title = document.createElement("input");
  title.className = "field-group-title";
  title.value = group.title;
  title.placeholder = "大分類";
  title.addEventListener("input", () => {
    group.title = title.value;
    saveCharacters();
  });

  const items = document.createElement("div");
  items.className = "field-group-items";
  group.fields.forEach((field) => {
    items.append(createFieldCard(group.id, field));
  });

  const addButton = document.createElement("button");
  addButton.className = "add-group-field-button";
  addButton.type = "button";
  addButton.textContent = "+";
  addButton.setAttribute("aria-label", `${group.title || "大項目"}に小項目を追加`);
  addButton.addEventListener("click", () => {
    group.fields.push({
      id: crypto.randomUUID(),
      category: "小項目",
      value: "",
      image: ""
    });
    saveCharacters();
    render();
    const added = section.querySelector(".profile-card:last-of-type .extra-label-field input");
    added?.focus();
    added?.select();
  });

  items.append(addButton);
  section.append(title, items);
  return section;
}

function createLooseFieldCard(field) {
  const card = createFieldCard(null, field);
  card.classList.add("loose-card");
  return card;
}

function createFieldCard(groupId, field) {
  const card = document.createElement("article");
  card.className = "profile-card";
  card.dataset.id = field.id;

  const categoryWrap = document.createElement("label");
  categoryWrap.className = "extra-label-field";

  const categoryInput = document.createElement("input");
  categoryInput.value = field.category;
  categoryInput.placeholder = "小項目";
  categoryInput.addEventListener("input", () => updateField(groupId, field.id, { category: categoryInput.value }));
  categoryWrap.append(categoryInput);

  const valueInput = document.createElement("textarea");
  valueInput.className = "auto-grow";
  valueInput.rows = 1;
  valueInput.value = field.value;
  valueInput.placeholder = "内容を書く";
  valueInput.addEventListener("input", () => {
    updateField(groupId, field.id, { value: valueInput.value });
    autoGrow(valueInput);
  });
  requestAnimationFrame(() => autoGrow(valueInput));

  const imageControl = document.createElement("label");
  imageControl.className = "field-image-button";
  imageControl.innerHTML = '<span class="image-icon" aria-hidden="true"></span>';
  imageControl.setAttribute("aria-label", `${field.category || "小項目"}に画像を追加`);
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      updateField(groupId, field.id, { image: String(reader.result) });
      render();
    });
    reader.readAsDataURL(file);
  });
  imageControl.append(imageInput);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-field";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", `${field.category || "項目"}を削除`);
  deleteButton.addEventListener("click", () => {
    const character = currentCharacter();
    if (!groupId) {
      character.looseFields = character.looseFields.filter((item) => item.id !== field.id);
      saveCharacters();
      render();
      return;
    }
    const group = character.fieldGroups.find((item) => item.id === groupId);
    if (!group) return;
    group.fields = group.fields.filter((item) => item.id !== field.id);
    character.fieldGroups = character.fieldGroups.filter((item) => item.fields.length);
    saveCharacters();
    render();
  });

  card.append(categoryWrap, valueInput, imageControl, deleteButton);

  if (field.image) {
    const imageWrap = document.createElement("div");
    imageWrap.className = "field-image-preview";

    const image = document.createElement("img");
    image.src = field.image;
    image.alt = `${field.category || "小項目"}の画像`;

    const removeImageButton = document.createElement("button");
    removeImageButton.type = "button";
    removeImageButton.textContent = "画像削除";
    removeImageButton.addEventListener("click", () => {
      updateField(groupId, field.id, { image: "" });
      render();
    });

    imageWrap.append(image, removeImageButton);
    card.append(imageWrap);
  }

  return card;
}

function updateField(groupId, id, patch) {
  const character = currentCharacter();
  const group = groupId ? character.fieldGroups.find((item) => item.id === groupId) : null;
  const field = groupId
    ? group?.fields.find((item) => item.id === id)
    : character.looseFields.find((item) => item.id === id);
  if (!field) return;
  Object.assign(field, patch);
  saveCharacters();
}

function createModalItemRow() {
  const row = document.createElement("div");
  row.className = "modal-item-row";

  const line = document.createElement("div");
  line.className = "modal-input-line";

  const label = document.createElement("span");
  label.textContent = "小項目";

  const category = document.createElement("input");
  category.className = "field-category-input";
  category.type = "text";
  category.placeholder = "例：幼少期";
  category.required = true;

  const randomButton = document.createElement("button");
  randomButton.className = "mini-button random-category-btn";
  randomButton.type = "button";
  randomButton.textContent = "🎲";
  randomButton.setAttribute("aria-label", "ランダム小項目");
  randomButton.addEventListener("click", () => fillRandomCategory(row));

  const removeButton = document.createElement("button");
  removeButton.className = "mini-button remove-modal-item-btn";
  removeButton.type = "button";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "小項目入力を削除");
  removeButton.addEventListener("click", () => row.remove());

  const value = document.createElement("textarea");
  value.className = "field-value-input auto-grow";
  value.rows = 1;
  value.placeholder = "内容を書く";
  value.addEventListener("input", () => autoGrow(value));

  const imageControl = document.createElement("label");
  imageControl.className = "field-image-button";
  imageControl.innerHTML = '<span class="image-icon" aria-hidden="true"></span>';
  imageControl.setAttribute("aria-label", "小項目に画像を追加");
  const imageInput = document.createElement("input");
  imageInput.className = "field-image-input";
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.addEventListener("change", () => previewModalImage(row));
  imageControl.append(imageInput);

  line.append(label, category, value, imageControl, randomButton, removeButton);
  row.append(line);
  return row;
}

function autoGrow(element) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

function previewModalImage(row) {
  const input = row.querySelector(".field-image-input");
  const file = input.files?.[0];
  row.querySelector(".modal-image-preview")?.remove();
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const preview = document.createElement("div");
    preview.className = "modal-image-preview";

    const image = document.createElement("img");
    image.src = String(reader.result);
    image.alt = "追加予定の画像";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "画像削除";
    removeButton.addEventListener("click", () => {
      input.value = "";
      preview.remove();
    });

    preview.append(image, removeButton);
    row.append(preview);
  });
  reader.readAsDataURL(file);
}

function readImageFile(input) {
  const file = input.files?.[0];
  if (!file) return Promise.resolve("");

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.readAsDataURL(file);
  });
}

function resetModalItems() {
  modalItems.innerHTML = "";
  const row = createModalItemRow();
  const infoButton = document.createElement("button");
  infoButton.id = "categoryInfoBtn";
  infoButton.className = "mini-button";
  infoButton.type = "button";
  infoButton.textContent = "i";
  infoButton.setAttribute("aria-label", "小項目サイコロの説明");
  infoButton.addEventListener("click", showCategoryInfo);
  row.querySelector(".remove-modal-item-btn").replaceWith(infoButton);
  modalItems.append(row);
}

function fillRandomCategory(row) {
  const categoryInput = row.querySelector(".field-category-input");
  const group = randomGroups.find((item) => item.title === fieldGroup.value.trim());
  if (group) {
    const category = group.categories[Math.floor(Math.random() * group.categories.length)];
    categoryInput.value = category;
    randomQuestion.textContent = `「${fieldGroup.value.trim()}」に沿った小項目です。`;
  } else {
    const question = questions[Math.floor(Math.random() * questions.length)];
    categoryInput.value = question.replace(/[？?]$/, "");
    randomQuestion.textContent = question;
  }
  row.querySelector(".field-value-input").focus();
}

function showCategoryInfo() {
  randomQuestion.textContent =
    "小項目のサイコロは、大項目が入っている時はそれに沿った小項目を入力します。小項目だけ使う時は深掘り質問を出します。";
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  lightThemeBtn.setAttribute("aria-pressed", String(theme === "light"));
  darkThemeBtn.setAttribute("aria-pressed", String(theme === "dark"));
}

characterSelect.addEventListener("change", () => {
  currentId = characterSelect.value;
  render();
});

addCharacterBtn.addEventListener("click", () => {
  const newCharacter = createCharacter(`新しいキャラ ${characters.length + 1}`);
  characters.push(newCharacter);
  currentId = newCharacter.id;
  saveCharacters();
  render();
  basicGrid.querySelector("input")?.focus();
  basicGrid.querySelector("input")?.select();
});

addBasicFieldBtn.addEventListener("click", () => {
  const character = currentCharacter();
  character.customBasics.push({
    id: crypto.randomUUID(),
    label: "項目",
    value: ""
  });
  saveCharacters();
  render();
  basicGrid.querySelector(".basic-field.custom:last-child .basic-label-input")?.focus();
});

imageColorInput.addEventListener("input", () => {
  const character = currentCharacter();
  character.imageColor = imageColorInput.value;
  applyImageColor(character.imageColor);
  saveCharacters();
});

exportBtn.addEventListener("click", downloadJsonBackup);

importInput.addEventListener("change", () => {
  const file = importInput.files?.[0];
  if (!file) return;
  importJsonBackup(file);
});

deleteCharacterBtn.addEventListener("click", () => {
  if (characters.length <= 1) return;
  const character = currentCharacter();
  const ok = confirm(`「${characterDisplayName(character)}」を削除しますか？`);
  if (!ok) return;
  characters = characters.filter((item) => item.id !== character.id);
  currentId = characters[0].id;
  saveCharacters();
  render();
});

lightThemeBtn.addEventListener("click", () => setTheme("light"));
darkThemeBtn.addEventListener("click", () => setTheme("dark"));

portraitInput.addEventListener("change", () => {
  const file = portraitInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    currentCharacter().image = String(reader.result);
    saveCharacters();
    render();
  });
  reader.readAsDataURL(file);
});

openFieldModalBtn.addEventListener("click", () => {
  fieldForm.reset();
  resetModalItems();
  randomQuestion.textContent = "項目のヒントが欲しい時だけ使えます。";
  groupOptions.innerHTML = "";
  currentCharacter().fieldGroups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.title;
    groupOptions.append(option);
  });
  fieldModal.showModal();
  fieldGroup.focus();
});

closeFieldModalBtn.addEventListener("click", () => fieldModal.close());
cancelFieldBtn.addEventListener("click", () => fieldModal.close());

randomQuestionBtn.addEventListener("click", () => {
  const question = questions[Math.floor(Math.random() * questions.length)];
  randomQuestion.textContent = question;
  const row = modalItems.querySelector(".modal-item-row");
  row.querySelector(".field-category-input").value = question.replace(/[？?]$/, "");
  row.querySelector(".field-value-input").focus();
});

randomGroupBtn.addEventListener("click", () => {
  const group = randomGroups[Math.floor(Math.random() * randomGroups.length)];
  const category = group.categories[Math.floor(Math.random() * group.categories.length)];
  fieldGroup.value = group.title;
  const row = modalItems.querySelector(".modal-item-row");
  row.querySelector(".field-category-input").value = category;
  randomQuestion.textContent = `「${group.title}」に沿って「${category}」を入れました。`;
  row.querySelector(".field-value-input").focus();
});

groupInfoBtn.addEventListener("click", () => {
  randomQuestion.textContent =
    "大項目のサイコロは「過去」「持ち物」「人間関係」などの大枠をランダム入力し、それに合う小項目も一緒に入れます。";
});

categoryInfoBtn.addEventListener("click", showCategoryInfo);

addModalItemBtn.addEventListener("click", () => {
  const row = createModalItemRow();
  modalItems.append(row);
  row.querySelector(".field-category-input").focus();
});

fieldForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const groupTitle = fieldGroup.value.trim();
  const rows = [...modalItems.querySelectorAll(".modal-item-row")];
  const newFields = (
    await Promise.all(rows.map(async (row) => ({
      id: crypto.randomUUID(),
      category: row.querySelector(".field-category-input").value.trim(),
      value: row.querySelector(".field-value-input").value.trim(),
      image: await readImageFile(row.querySelector(".field-image-input"))
    })))
  ).filter((field) => field.category);

  if (!newFields.length) return;

  const character = currentCharacter();
  if (!groupTitle) {
    character.looseFields.push(...newFields);
    saveCharacters();
    fieldModal.close();
    render();
    return;
  }

  let group = character.fieldGroups.find((item) => item.title.trim() === groupTitle);
  if (!group) {
    group = {
      id: crypto.randomUUID(),
      title: groupTitle,
      fields: []
    };
    character.fieldGroups.push(group);
  }

  group.fields.push(...newFields);
  saveCharacters();
  fieldModal.close();
  render();
});

setTheme(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");
render();

helpBtn.addEventListener("click", () => helpModal.showModal());
closeHelpBtn.addEventListener("click", () => helpModal.close());
