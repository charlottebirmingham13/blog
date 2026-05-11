const isPostPage = location.pathname.endsWith('post.html');

if (isPostPage) {
  loadPost();
} else {
  loadList('post-list', 'posts/index.json');
  loadList('translation-list', 'translations/index.json', { type: 'translation' });
}

async function loadList(elementId, manifestUrl, options = {}) {
  const list = document.getElementById(elementId);
  if (!list) return;
  try {
    const res = await fetch(manifestUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();
    items.sort((a, b) => b.date.localeCompare(a.date));
    if (items.length === 0) {
      list.innerHTML = '<li class="dim">—</li>';
    } else {
      const typeParam = options.type ? `&type=${encodeURIComponent(options.type)}` : '';
      list.innerHTML = items.map(item => `
        <li class="post-summary">
          <a href="post.html?slug=${encodeURIComponent(item.slug)}${typeParam}">
            <h2 class="post-summary-title" dir="auto">${escapeHtml(item.title)}</h2>
            <time class="post-summary-date" datetime="${escapeHtml(item.date)}">${formatDate(item.date)}</time>
          </a>
        </li>
      `).join('');
    }
    list.removeAttribute('aria-busy');
  } catch (err) {
    list.innerHTML = `<li class="error">Couldn't load: ${escapeHtml(err.message)}</li>`;
  }
}

async function loadPost() {
  const article = document.getElementById('post');
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug') || '';
  const type = params.get('type') || 'post';
  const folder = type === 'translation' ? 'translations' : 'posts';

  if (!/^[a-z0-9-]+$/i.test(slug)) {
    article.innerHTML = '<p class="error">No post specified.</p>';
    article.removeAttribute('aria-busy');
    return;
  }

  try {
    const [indexRes, mdRes] = await Promise.all([
      fetch(`${folder}/index.json`),
      fetch(`${folder}/${slug}.md`),
    ]);

    if (!mdRes.ok) throw new Error(mdRes.status === 404 ? 'Not found' : `HTTP ${mdRes.status}`);
    const md = await mdRes.text();

    article.innerHTML = marked.parse(md);
    article.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote').forEach(el => {
      el.setAttribute('dir', 'auto');
    });
    article.removeAttribute('aria-busy');

    if (indexRes.ok) {
      const items = await indexRes.json();
      const meta = items.find(p => p.slug === slug);
      if (meta) document.title = `${meta.title} — Charlotte`;
    }
  } catch (err) {
    article.innerHTML = `<p class="error">Couldn't load: ${escapeHtml(err.message)}</p>`;
    article.removeAttribute('aria-busy');
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  if (iso.includes('T')) {
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
