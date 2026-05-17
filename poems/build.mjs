import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'english-poems.md');
const OUT = join(ROOT, 'english');

const POEMS = [
  { heading: 'The Raven',                         slug: 'the-raven',                     title: 'The Raven',                          author: 'Edgar Allan Poe' },
  { heading: 'Alone',                             slug: 'alone',                         title: 'Alone',                              author: 'Edgar Allan Poe' },
  { heading: 'Annabel Lee',                       slug: 'annabel-lee',                   title: 'Annabel Lee',                        author: 'Edgar Allan Poe' },
  { heading: 'A Dream Within a Dream',            slug: 'a-dream-within-a-dream',        title: 'A Dream Within a Dream',             author: 'Edgar Allan Poe' },
  { heading: 'Spirits of the Dead',               slug: 'spirits-of-the-dead',           title: 'Spirits of the Dead',                author: 'Edgar Allan Poe' },
  { heading: 'To the River',                      slug: 'to-the-river',                  title: 'To the River',                       author: 'Edgar Allan Poe' },
  { heading: 'from In Memoriam A.H.H.',           slug: 'in-memoriam',                   title: 'In Memoriam A.H.H. (excerpt)',       author: 'Alfred, Lord Tennyson' },
  { heading: 'from The Lady of Shalott',          slug: 'the-lady-of-shalott',           title: 'The Lady of Shalott (excerpt)',      author: 'Alfred, Lord Tennyson' },
  { heading: 'from Ulysses',                      slug: 'ulysses',                       title: 'Ulysses (excerpt)',                  author: 'Alfred, Lord Tennyson' },
  { heading: "I'm Nobody! Who are you? (260)",    slug: 'im-nobody',                     title: "I'm Nobody! Who are you?",           author: 'Emily Dickinson' },
  { heading: 'Wild Nights—Wild Nights! (249)',    slug: 'wild-nights',                   title: 'Wild Nights — Wild Nights!',         author: 'Emily Dickinson' },
  { heading: 'I felt a Funeral, in my Brain (280)', slug: 'i-felt-a-funeral-in-my-brain', title: 'I felt a Funeral, in my Brain',     author: 'Emily Dickinson' },
  { heading: 'from Paradise Lost, Book I',        slug: 'paradise-lost-book-i',          title: 'Paradise Lost, Book I (excerpt)',    author: 'John Milton' },
  { heading: 'from Paradise Lost, Book XII',      slug: 'paradise-lost-book-xii',        title: 'Paradise Lost, Book XII (excerpt)',  author: 'John Milton' },
  { heading: 'from My Last Duchess',              slug: 'my-last-duchess',               title: 'My Last Duchess (excerpt)',          author: 'Robert Browning' },
  { heading: 'from Prospice',                     slug: 'prospice',                      title: 'Prospice (excerpt)',                 author: 'Robert Browning' },
  { heading: 'Do Not Stand at My Grave and Weep', slug: 'do-not-stand-at-my-grave-and-weep', title: 'Do Not Stand at My Grave and Weep', author: 'Clare Harner' },
  { heading: "I Don't Mean to Move Too Fast",     slug: 'i-dont-mean-to-move-too-fast',  title: "I Don't Mean to Move Too Fast",      author: 'Daniel Garrison' },
  { heading: 'Untitled',                          slug: 'untitled',                      title: 'Untitled',                           author: 'unknown' },
];

const text = await readFile(SRC, 'utf8');
const lines = text.split('\n');

const blocks = new Map();
let cur = null;
for (const line of lines) {
  const h3 = line.match(/^### (.+?)\s*$/);
  if (h3) {
    if (cur) blocks.set(cur.heading, cur.body);
    cur = { heading: h3[1], body: [] };
    continue;
  }
  if (/^#{1,2} /.test(line)) {
    if (cur) { blocks.set(cur.heading, cur.body); cur = null; }
    continue;
  }
  if (cur) cur.body.push(line);
}
if (cur) blocks.set(cur.heading, cur.body);

await mkdir(OUT, { recursive: true });

const index = [];
let missing = 0;
for (const { heading, slug, title, author } of POEMS) {
  const raw = blocks.get(heading);
  if (!raw) {
    console.error(`! heading not found in english-poems.md: "${heading}"`);
    missing++;
    continue;
  }
  let body = raw
    .filter(l => l.trim() !== '---')
    .map(l => l.replace(/^[ \t]+/, ''))
    .join('\n')
    .replace(/^\s+|\s+$/g, '');
  body = body.replace(/^\*[^*\n][^*]*\*[^\S\n]*\n+/, '');

  const md = `# ${title}\n\n*${author}.*\n\n${body}\n`;
  await writeFile(join(OUT, `${slug}.md`), md, 'utf8');
  index.push({ slug, title, author });
}

await writeFile(join(OUT, 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`Wrote ${index.length} poems + index.json to ${OUT}` + (missing ? ` (${missing} missing)` : ''));
if (missing) process.exitCode = 1;
