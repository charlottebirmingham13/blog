const isPostPage = location.pathname.endsWith('post.html');

if (isPostPage) {
  loadPost();
} else {
  loadList();
}

async function loadList() {
  const list = document.getElementById('post-list');
  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    posts.sort((a, b) => b.date.localeCompare(a.date));
    list.innerHTML = posts.map(p => `
      <li class="post-summary">
        <a href="post.html?slug=${encodeURIComponent(p.slug)}">
          <h2 class="post-summary-title" dir="auto">${escapeHtml(p.title)}</h2>
          <time class="post-summary-date" datetime="${escapeHtml(p.date)}">${formatDate(p.date)}</time>
          <p class="post-summary-excerpt" dir="auto">${escapeHtml(p.excerpt)}</p>
        </a>
      </li>
    `).join('');
    list.removeAttribute('aria-busy');
  } catch (err) {
    list.innerHTML = `<li class="error">Couldn't load posts: ${escapeHtml(err.message)}</li>`;
  }
}

async function loadPost() {
  const article = document.getElementById('post');
  const slug = new URLSearchParams(location.search).get('slug') || '';

  if (!/^[a-z0-9-]+$/i.test(slug)) {
    article.innerHTML = '<p class="error">No post specified.</p>';
    article.removeAttribute('aria-busy');
    return;
  }

  try {
    const [indexRes, mdRes] = await Promise.all([
      fetch('posts/index.json'),
      fetch(`posts/${slug}.md`),
    ]);

    if (!mdRes.ok) throw new Error(mdRes.status === 404 ? 'Post not found' : `HTTP ${mdRes.status}`);
    const md = await mdRes.text();

    article.innerHTML = marked.parse(md);
    article.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote').forEach(el => {
      el.setAttribute('dir', 'auto');
    });
    article.removeAttribute('aria-busy');

    if (indexRes.ok) {
      const posts = await indexRes.json();
      const meta = posts.find(p => p.slug === slug);
      if (meta) document.title = `${meta.title} — Blog`;
    }
  } catch (err) {
    article.innerHTML = `<p class="error">Couldn't load post: ${escapeHtml(err.message)}</p>`;
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
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
