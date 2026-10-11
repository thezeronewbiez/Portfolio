(() => {
  // ระบุบัญชีเจ้าของ repo และเตรียม URL สำหรับเรียก API กับลิงก์หน้าโปรไฟล์
  const username = 'thezeronewbiez';
  const apiBase = `https://api.github.com/users/${username}`;
  const profileUrl = `https://github.com/${username}`;
  const profileName = document.querySelector('#github-title');
  const profileBio = document.querySelector('#github-bio');
  const avatar = document.querySelector('#github-avatar');
  const repoCount = document.querySelector('#github-repo-count');
  const starCount = document.querySelector('#github-star-count');
  const followerCount = document.querySelector('#github-follower-count');
  const languageList = document.querySelector('#github-languages');
  const recentList = document.querySelector('#github-recent-list');
  const filterList = document.querySelector('#github-filters');
  const searchInput = document.querySelector('#github-search');
  const status = document.querySelector('#github-status');
  const repoGrid = document.querySelector('#github-repo-grid');

  // ถ้าหน้านี้ไม่มีพื้นที่แสดง repo ก็ไม่ต้องเริ่มทำงาน
  if (!repoGrid) return;

  // กำหนดสีประจำภาษาให้จุดและแถบดูง่ายขึ้น
  const languageColors = {
    CSS: '#563d7c',
    HTML: '#e34c26',
    Java: '#b07219',
    JavaScript: '#f1e05a',
    Lua: '#000080',
    PHP: '#4f5d95',
    Python: '#3572A5',
    TypeScript: '#3178c6'
  };

  let repositories = [];
  let activeLanguage = 'All';

  // สร้าง element กลางไว้ใช้ซ้ำ จะได้ใส่ข้อความผ่าน textContent อย่างปลอดภัย
  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function safeRepositoryUrl(repository) {
    try {
      const url = new URL(repository.html_url);
      if (url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith(`/${username}/`)) {
        return url.href;
      }
    } catch {
      // ถ้าลิงก์ที่ได้ดูไม่ถูกต้อง ให้พาไปหน้าโปรไฟล์ที่เรารู้จักแทน
    }
    return profileUrl;
  }

  function relativeDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'date unavailable';

    const days = Math.round((date.getTime() - Date.now()) / 86400000);
    const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(days) < 30) return relative.format(days, 'day');
    const months = Math.round(days / 30);
    if (Math.abs(months) < 12) return relative.format(months, 'month');
    return relative.format(Math.round(days / 365), 'year');
  }

  function languageColor(language) {
    return languageColors[language] || '#8c77ff';
  }

  function renderProfile(profile) {
    // นำข้อมูลบัญชีจาก GitHub ไปใส่ในส่วนหัวของ dashboard
    profileName.textContent = profile.name || profile.login;
    profileBio.textContent = profile.bio || 'Software engineering projects, experiments, and learning in progress.';
    avatar.src = profile.avatar_url;
    avatar.alt = `${profile.login} GitHub avatar`;
    repoCount.textContent = profile.public_repos.toLocaleString();
    followerCount.textContent = profile.followers.toLocaleString();
  }

  function renderLanguages() {
    // นับจำนวน repo แยกตามภาษา แล้วเรียงให้ภาษาที่ใช้บ่อยอยู่บนสุด
    const counts = new Map();
    repositories.forEach(repository => {
      if (repository.language) counts.set(repository.language, (counts.get(repository.language) || 0) + 1);
    });

    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    languageList.replaceChildren();
    if (!entries.length) {
      languageList.append(makeElement('p', 'github-muted', 'No language data is available yet.'));
      return;
    }

    const maximum = entries[0][1];
    entries.slice(0, 5).forEach(([language, count]) => {
      const row = makeElement('div', 'github-language-row');
      const name = makeElement('span', '', language);
      const track = makeElement('span', 'github-language-track');
      const fill = makeElement('span', 'github-language-fill');
      fill.style.width = `${(count / maximum) * 100}%`;
      fill.style.setProperty('--language-color', languageColor(language));
      track.append(fill);
      row.append(name, track, makeElement('span', 'github-language-count', `${count} ${count === 1 ? 'repo' : 'repos'}`));
      languageList.append(row);
    });
  }

  function renderRecentRepositories() {
    // เรียง repo ตามวันที่อัปเดต แล้วเลือกมาแสดงแค่ 3 รายการล่าสุด
    recentList.replaceChildren();
    const recent = [...repositories]
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
      .slice(0, 3);

    if (!recent.length) {
      recentList.append(makeElement('li', 'github-muted', 'No public repositories are available.'));
      return;
    }

    recent.forEach(repository => {
      const item = makeElement('li');
      const link = makeElement('a');
      link.href = safeRepositoryUrl(repository);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(
        makeElement('span', '', repository.name),
        makeElement('time', '', relativeDate(repository.pushed_at || repository.updated_at))
      );
      item.append(link);
      recentList.append(item);
    });
  }

  function renderFilters() {
    // สร้างปุ่มกรองจากภาษาที่พบจริงใน repo
    const languages = [...new Set(repositories.map(repository => repository.language).filter(Boolean))].sort();
    filterList.replaceChildren();

    ['All', ...languages].forEach(language => {
      const button = makeElement('button', 'github-filter', language);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(language === activeLanguage));
      button.addEventListener('click', () => {
        // จำภาษาที่เลือก แล้ววาดปุ่มกับรายการ repo ใหม่
        activeLanguage = language;
        renderFilters();
        renderRepositories();
      });
      filterList.append(button);
    });
  }

  function createRepositoryCard(repository) {
    // ประกอบข้อมูล repo หนึ่งอันเป็นการ์ด พร้อมลิงก์ไป GitHub
    const card = makeElement('article', 'github-repo-card');
    const top = makeElement('div', 'github-repo-card-top');
    const nameLink = makeElement('a', 'github-repo-name');
    const repoIcon = makeElement('i', 'bi bi-journal-code');
    repoIcon.setAttribute('aria-hidden', 'true');
    nameLink.href = safeRepositoryUrl(repository);
    nameLink.target = '_blank';
    nameLink.rel = 'noopener noreferrer';
    nameLink.append(repoIcon, document.createTextNode(repository.name));
    top.append(nameLink, makeElement('span', 'github-repo-visibility', repository.private ? 'Private' : 'Public'));

    const description = makeElement(
      'p',
      'github-repo-description',
      repository.description || 'No description provided for this repository.'
    );

    const topics = makeElement('div', 'github-repo-topics');
    (repository.topics || []).slice(0, 3).forEach(topic => {
      topics.append(makeElement('span', 'github-repo-topic', topic));
    });

    const meta = makeElement('div', 'github-repo-meta');
    if (repository.language) {
      const language = makeElement('span', 'github-repo-language');
      const dot = makeElement('span', 'github-language-dot');
      dot.style.setProperty('--language-color', languageColor(repository.language));
      dot.setAttribute('aria-hidden', 'true');
      language.append(dot, document.createTextNode(repository.language));
      meta.append(language);
    }

    const stats = makeElement('span', 'github-repo-stats');
    const stars = makeElement('span');
    stars.innerHTML = '<i class="bi bi-star" aria-hidden="true"></i> ';
    stars.append(document.createTextNode(repository.stargazers_count.toLocaleString()));
    const forks = makeElement('span');
    forks.innerHTML = '<i class="bi bi-diagram-2" aria-hidden="true"></i> ';
    forks.append(document.createTextNode(repository.forks_count.toLocaleString()));
    stats.append(stars, forks);
    meta.append(stats);

    const footer = makeElement('div', 'github-repo-card-top');
    footer.append(meta);
    const viewLink = makeElement('a', 'github-card-link', 'View repository');
    viewLink.href = safeRepositoryUrl(repository);
    viewLink.target = '_blank';
    viewLink.rel = 'noopener noreferrer';
    const arrow = makeElement('i', 'bi bi-arrow-up-right');
    arrow.setAttribute('aria-hidden', 'true');
    viewLink.append(arrow);
    footer.append(viewLink);

    card.append(top, description, topics, footer);
    return card;
  }

  function renderRepositories() {
    // เอาคำค้นกับภาษาที่เลือกมาใช้กรองรายการ ก่อนวาดการ์ดใหม่
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filtered = repositories.filter(repository => {
      const languageMatches = activeLanguage === 'All' || repository.language === activeLanguage;
      const searchableText = [repository.name, repository.description, ...(repository.topics || [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return languageMatches && searchableText.includes(query);
    });

    repoGrid.replaceChildren();
    filtered.forEach(repository => repoGrid.append(createRepositoryCard(repository)));
    status.textContent = filtered.length
      ? `Showing ${filtered.length} of ${repositories.length} public repositories. Data synced from GitHub.`
      : 'No repositories match these filters. Try another search or language.';
  }

  async function fetchJson(url) {
    // เรียก GitHub API และแจ้งปัญหาตามสถานะที่ตอบกลับ
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error('GitHub API rate limit reached. Please try again later, or visit the profile directly.');
      }
      if (response.status === 404) throw new Error('The configured GitHub profile could not be found.');
      throw new Error(`GitHub API request failed (${response.status}). Please try again later.`);
    }
    return response.json();
  }

  async function loadGitHubData() {
    try {
      // ดึงข้อมูลโปรไฟล์กับ repo พร้อมกัน เพื่อลดเวลารอ
      const [profile, repoData] = await Promise.all([
        fetchJson(apiBase),
        fetchJson(`${apiBase}/repos?type=owner&sort=updated&per_page=100`)
      ]);

      renderProfile(profile);
      repositories = repoData.filter(repository => !repository.private && !repository.archived);
      starCount.textContent = repositories
        .reduce((total, repository) => total + repository.stargazers_count, 0)
        .toLocaleString();

      renderLanguages();
      renderRecentRepositories();
      renderFilters();
      searchInput.addEventListener('input', renderRepositories);
      renderRepositories();
    } catch (error) {
      // ถ้าโหลดไม่สำเร็จ แสดงข้อความแทนปล่อยให้ dashboard ว่างเปล่า
      status.textContent = error instanceof Error ? error.message : 'Unable to load GitHub repositories.';
      profileBio.textContent = 'Live repository data is temporarily unavailable.';
      languageList.replaceChildren(makeElement('p', 'github-muted', 'Language data could not be loaded.'));
      recentList.replaceChildren(makeElement('li', 'github-muted', 'Recent repositories could not be loaded.'));
    }
  }

  // รอให้ผู้ใช้เปิด dashboard ก่อน แล้วค่อยเรียก API แค่ครั้งแรก
  document.addEventListener('github:show-repositories', loadGitHubData, { once: true });
})();
