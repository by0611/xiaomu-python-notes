'use strict';

const categories = ['語法基礎', '資料結構', '除錯練習'];
const storageKey = 'xiaomu-python-notes-read-v1';
let lessons = [];
let readSlugs = new Set();

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function loadReadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) readSlugs = new Set(saved.filter(value => typeof value === 'string'));
  } catch {
    readSlugs = new Set();
  }
}

function lessonLink(lesson) {
  return `lesson.html?slug=${encodeURIComponent(lesson.slug)}`;
}

function renderHome() {
  const grid = document.getElementById('lesson-grid');
  const search = document.getElementById('search');
  const status = document.getElementById('result-status');
  const empty = document.getElementById('empty-state');
  let selectedCategory = '全部筆記';
  document.getElementById('total-count').textContent = lessons.length;
  document.getElementById('reading-progress').textContent = `已讀 ${lessons.filter(item => readSlugs.has(item.slug)).length} / ${lessons.length}`;

  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = lessons.filter(lesson => {
      const matchesCategory = selectedCategory === '全部筆記' || lesson.category === selectedCategory;
      const searchable = [lesson.title, lesson.summary, lesson.category, ...lesson.tags].join(' ').toLocaleLowerCase();
      return matchesCategory && searchable.includes(query);
    });
    grid.replaceChildren();
    for (const lesson of visible) {
      const number = String(lessons.indexOf(lesson) + 1).padStart(2, '0');
      const card = node('a', 'lesson-card');
      card.href = lessonLink(lesson);
      card.dataset.topic = lesson.category;
      const top = node('div', 'card-top');
      const symbol = ['>_', '{ }', '!'][categories.indexOf(lesson.category)];
      top.append(node('span', 'card-symbol', symbol), node('span', 'card-number', `NOTE ${number}`));
      top.setAttribute('aria-hidden', 'true');
      const heading = node('h3', '', lesson.title);
      const meta = node('div', 'card-bottom');
      const reading = node('span', '', `${lesson.minutes} 分鐘閱讀`);
      if (readSlugs.has(lesson.slug)) reading.append(node('span', 'read-badge', '✓ 已讀'));
      const arrow = node('span', 'card-arrow', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      meta.append(reading, arrow);
      card.append(top, node('span', 'topic-tag', lesson.category), heading,
        node('p', 'card-summary', lesson.summary), meta);
      grid.append(card);
    }
    status.textContent = query ? `「${search.value.trim()}」找到 ${visible.length} 篇筆記` : `共 ${visible.length} 篇筆記，選一篇開始吧。`;
    empty.hidden = visible.length !== 0;
  }

  for (const button of document.querySelectorAll('.filter')) {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      for (const filter of document.querySelectorAll('.filter')) {
        const active = filter === button;
        filter.classList.toggle('active', active);
        filter.setAttribute('aria-pressed', String(active));
      }
      update();
    });
  }
  search.addEventListener('input', update);
  document.getElementById('reset-search').addEventListener('click', () => {
    search.value = '';
    document.querySelector('.filter').click();
    search.focus();
  });
  update();
}

function section(id, title) {
  const element = node('section');
  element.id = id;
  element.append(node('h2', '', title));
  return element;
}

function renderQuiz(quiz) {
  const box = node('form', 'quiz-box');
  const fieldset = node('fieldset');
  fieldset.append(node('legend', '', quiz.question));
  quiz.choices.forEach((choice, index) => {
    const label = node('label', 'quiz-option');
    const radio = node('input');
    radio.type = 'radio';
    radio.name = 'quiz-answer';
    radio.value = String(index);
    label.append(radio, node('span', '', choice));
    fieldset.append(label);
  });
  const submit = node('button', 'button primary', '檢查答案');
  submit.type = 'submit';
  const feedback = node('p', 'quiz-feedback');
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  box.append(fieldset, submit, feedback);
  box.addEventListener('submit', event => {
    event.preventDefault();
    const checked = fieldset.querySelector('input:checked');
    if (!checked) {
      feedback.textContent = '先選一個答案，再一起確認吧。';
      return;
    }
    const correct = Number(checked.value) === quiz.answer;
    feedback.textContent = `${correct ? '✓ 答對了！' : '再想一想。'} ${quiz.explanation}`;
  });
  box.addEventListener('change', () => { feedback.textContent = ''; });
  return box;
}

function renderLesson() {
  const container = document.getElementById('lesson-content');
  const slug = new URLSearchParams(location.search).get('slug');
  const lesson = slug === null ? lessons[0] : lessons.find(item => item.slug === slug);
  container.replaceChildren();
  if (!lesson) {
    const title = node('h1', '', '找不到這篇筆記');
    const note = node('p', 'notice', '這個連結可能已經變更，回到筆記清單找找看。');
    container.append(title, note);
    document.title = '找不到筆記｜小沐 Python 知識站';
    return;
  }
  document.title = `${lesson.title}｜小沐 Python 知識站`;
  const header = node('div', 'lesson-header');
  const meta = node('div', 'lesson-meta');
  meta.append(node('span', 'category-chip', lesson.category), node('span', '', `${lesson.minutes} 分鐘閱讀`),
    node('span', '', `NOTE ${String(lessons.indexOf(lesson) + 1).padStart(2, '0')}`));
  const tags = node('div', 'tag-list');
  lesson.tags.forEach(tag => tags.append(node('span', '', `# ${tag}`)));
  header.append(meta, node('h1', '', lesson.title), node('p', '', lesson.summary), tags);
  const layout = node('div', 'lesson-layout');
  const toc = node('nav', 'lesson-toc');
  toc.setAttribute('aria-label', '本篇目錄');
  toc.append(node('span', '', 'IN THIS NOTE'));
  const sections = [['objectives', '學習目標'], ['concepts', '先懂觀念'], ['example', '動手看範例'],
    ['output', '預期輸出'], ['mistake', '常見錯誤'], ['practice', '小練習']];
  for (const [id, label] of sections) {
    const link = node('a', '', label);
    link.href = `#${id}`;
    toc.append(link);
  }
  const article = node('article', 'lesson-article');
  const objectives = section('objectives', '這篇你會學到');
  objectives.className = 'objectives';
  const list = node('ul');
  lesson.objectives.forEach(objective => list.append(node('li', '', objective)));
  objectives.append(list);
  const concepts = section('concepts', '先懂觀念');
  lesson.concepts.forEach(paragraph => concepts.append(node('p', '', paragraph)));
  const example = section('example', '動手看範例');
  const codeContainer = node('div', 'code-container');
  const toolbar = node('div', 'code-toolbar');
  const copy = node('button', 'copy-code', '複製程式');
  copy.type = 'button';
  const code = node('code', '', lesson.code);
  const pre = node('pre');
  pre.append(code);
  toolbar.append(node('span', '', 'PYTHON 3'), copy);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(lesson.code);
      copy.textContent = '✓ 已複製';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      copy.textContent = '已選取，請複製';
    }
  });
  codeContainer.append(toolbar, pre);
  example.append(codeContainer);
  const output = section('output', '預期輸出');
  output.append(node('pre', 'output-box', lesson.output.trimEnd()));
  const mistake = section('mistake', '常見錯誤');
  const mistakeBox = node('div', 'mistake-box');
  mistakeBox.append(node('h3', '', lesson.mistake.title), node('p', '', lesson.mistake.text));
  mistake.append(mistakeBox);
  const practice = section('practice', '小練習，確認一下');
  practice.append(renderQuiz(lesson.quiz));
  const end = node('div', 'lesson-end');
  const readButton = node('button', 'button read-button');
  readButton.type = 'button';
  function updateReadButton() {
    const read = readSlugs.has(lesson.slug);
    readButton.textContent = read ? '✓ 已標記為已讀' : '標記這篇已讀';
    readButton.setAttribute('aria-pressed', String(read));
  }
  readButton.addEventListener('click', () => {
    if (readSlugs.has(lesson.slug)) readSlugs.delete(lesson.slug);
    else readSlugs.add(lesson.slug);
    try { localStorage.setItem(storageKey, JSON.stringify([...readSlugs])); } catch { /* 閱讀仍可繼續。 */ }
    updateReadButton();
  });
  updateReadButton();
  end.append(node('span', '', '多理解一點，就是今天的進步。'), readButton);
  const pagination = node('nav', 'pagination');
  pagination.setAttribute('aria-label', '筆記閱讀順序');
  const currentIndex = lessons.indexOf(lesson);
  const neighbors = [lessons[currentIndex - 1], lessons[currentIndex + 1]];
  neighbors.forEach((neighbor, index) => {
    const link = node('a');
    link.href = neighbor ? lessonLink(neighbor) : 'index.html#notes';
    link.append(node('small', '', index === 0 ? '← 上一篇' : '下一篇 →'),
      node('strong', '', neighbor ? neighbor.title : '回到所有筆記'));
    pagination.append(link);
  });
  article.append(objectives, concepts, example, output, mistake, practice, end, pagination);
  layout.append(toc, article);
  container.append(header, layout);
}

async function start() {
  const page = document.body.dataset.page;
  if (!page) return;
  loadReadProgress();
  try {
    const response = await fetch('content/lessons.json');
    if (!response.ok) throw new Error('load');
    lessons = await response.json();
    if (!Array.isArray(lessons) || lessons.length === 0) throw new Error('empty');
    if (page === 'home') renderHome();
    else renderLesson();
  } catch {
    const target = document.getElementById(page === 'home' ? 'result-status' : 'lesson-content');
    target.replaceChildren(node('p', 'notice', '筆記暫時無法載入，請重新整理頁面後再試一次。'));
  }
}

start();
