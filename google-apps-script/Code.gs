const CONFIG = {
  repo: 'barrack3030-wq/propolis-2',
  branch: 'main',
  postsIndex: 'content/posts/index.json',
  siteUrl: 'https://agenbptoili.my.id/',
  githubApi: 'https://api.github.com'
};

/* =========================
   WEB APP
========================= */

function doGet() {
  const props = PropertiesService.getScriptProperties();
  return jsonResponse({
    ok: true,
    service: 'British Propolis Toili CMS',
    status: 'online',
    cms_key_configured: !!String(props.getProperty('CMS_API_KEY') || '').trim(),
    github_token_configured: !!String(props.getProperty('GITHUB_TOKEN') || '').trim(),
    openai_key_configured: !!String(props.getProperty('OPENAI_API_KEY') || '').trim(),
    facebook_configured:
      !!String(props.getProperty('FACEBOOK_PAGE_ID') || '').trim() &&
      !!String(props.getProperty('FACEBOOK_PAGE_ACCESS_TOKEN') || '').trim()
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        ok: false,
        error: 'Request body kosong.'
      });
    }

    const data = JSON.parse(e.postData.contents || '{}');
    const configuredKey = String(
      PropertiesService.getScriptProperties().getProperty('CMS_API_KEY') || ''
    ).trim();

    // Support both names so old/new CMS frontend remain compatible.
    const receivedKey = String(data.api_key || data.apiKey || '').trim();

    if (!configuredKey) {
      return jsonResponse({
        ok: false,
        error: 'CMS_API_KEY belum dikonfigurasi di Script Properties.'
      });
    }

    if (!receivedKey) {
      return jsonResponse({
        ok: false,
        error: 'CMS API Key belum diisi.'
      });
    }

    if (receivedKey !== configuredKey) {
      return jsonResponse({
        ok: false,
        error: 'CMS API Key salah.'
      });
    }

    switch (data.action) {
      case 'list_posts':
        return jsonResponse(listPosts());

      case 'save_post':
        return jsonResponse(savePost(data.post));

      case 'delete_post':
        return jsonResponse(deletePost(data.slug));

      case 'publish_facebook':
        return jsonResponse(publishFacebook(data.slug));

      case 'generate_ai_article':
        return jsonResponse(generateAIArticle(data.prompt || {}));

      default:
        return jsonResponse({
          ok: false,
          error: 'Action tidak dikenal: ' + String(data.action || '')
        });
    }

  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
}

/* =========================
   GITHUB HELPERS
========================= */

function githubHeaders() {
  const token = String(
    PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN') || ''
  ).trim();

  if (!token) {
    throw new Error('GITHUB_TOKEN belum dikonfigurasi di Script Properties.');
  }

  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function githubFileUrl(path) {
  return CONFIG.githubApi +
    '/repos/' + CONFIG.repo +
    '/contents/' + path +
    '?ref=' + encodeURIComponent(CONFIG.branch);
}

function githubGetFile(path) {
  try {
    const response = UrlFetchApp.fetch(githubFileUrl(path), {
      method: 'get',
      headers: githubHeaders(),
      muteHttpExceptions: true
    });

    const status = response.getResponseCode();
    const raw = response.getContentText();

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      return {
        ok: false,
        error: 'Respons GitHub tidak valid. HTTP ' + status
      };
    }

    if (status < 200 || status >= 300) {
      return {
        ok: false,
        error: 'GitHub error ' + status + ': ' + (data.message || raw)
      };
    }

    if (!data.content) {
      return {
        ok: false,
        error: 'File GitHub tidak memiliki content.'
      };
    }

    const decoded = Utilities.newBlob(
      Utilities.base64Decode(data.content.replace(/\s/g, ''))
    ).getDataAsString('UTF-8');

    return {
      ok: true,
      content: decoded,
      sha: data.sha,
      name: data.name
    };

  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}

function githubUpdateFile(path, content, sha, message) {
  try {
    const payload = {
      message: message || 'CMS update',
      content: Utilities.base64Encode(
        Utilities.newBlob(content, 'text/plain', path).getBytes()
      ),
      branch: CONFIG.branch
    };

    if (sha) {
      payload.sha = sha;
    }

    const response = UrlFetchApp.fetch(
      CONFIG.githubApi + '/repos/' + CONFIG.repo + '/contents/' + path,
      {
        method: 'put',
        headers: githubHeaders(),
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }
    );

    const status = response.getResponseCode();
    const raw = response.getContentText();

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      return {
        ok: false,
        error: 'Respons update GitHub tidak valid. HTTP ' + status
      };
    }

    if (status < 200 || status >= 300) {
      return {
        ok: false,
        error: 'GitHub update error ' + status + ': ' + (data.message || raw)
      };
    }

    return {
      ok: true,
      sha: data.content ? data.content.sha : ''
    };

  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}

/* =========================
   LIST POSTS
========================= */

function listPosts() {
  const file = githubGetFile(CONFIG.postsIndex);

  if (!file.ok) {
    return file;
  }

  let posts = [];

  try {
    posts = JSON.parse(file.content);
  } catch (error) {
    return {
      ok: false,
      error: 'index.json tidak valid.'
    };
  }

  return {
    ok: true,
    posts: posts
  };
}

/* =========================
   SAVE POST
========================= */

function savePost(post) {
  if (!post) {
    return {
      ok: false,
      error: 'Data artikel kosong.'
    };
  }

  if (!post.slug || !post.title) {
    return {
      ok: false,
      error: 'Slug dan title wajib diisi.'
    };
  }

  const file = githubGetFile(CONFIG.postsIndex);

  if (!file.ok) {
    return file;
  }

  let posts = [];

  try {
    posts = JSON.parse(file.content);
    if (!Array.isArray(posts)) posts = [];
  } catch (error) {
    posts = [];
  }

  const newPost = {
    slug: String(post.slug).trim(),
    title: String(post.title).trim(),
    category: String(post.category || 'Edukasi').trim(),
    date: post.date || Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'Asia/Makassar',
      'yyyy-MM-dd'
    ),
    image: String(post.image || '').trim(),
    excerpt: String(post.excerpt || '').trim(),
    seo_description: String(post.seo_description || '').trim(),
    content: String(post.content || '')
  };

  const index = posts.findIndex(function(item) {
    return item && item.slug === newPost.slug;
  });

  if (index >= 0) {
    posts[index] = newPost;
  } else {
    posts.unshift(newPost);
  }

  const result = githubUpdateFile(
    CONFIG.postsIndex,
    JSON.stringify(posts, null, 2),
    file.sha,
    'CMS: save article ' + newPost.slug
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    message: 'Artikel berhasil disimpan.',
    post: newPost
  };
}

/* =========================
   DELETE POST
========================= */

function deletePost(slug) {
  if (!slug) {
    return {
      ok: false,
      error: 'Slug artikel tidak ada.'
    };
  }

  const file = githubGetFile(CONFIG.postsIndex);

  if (!file.ok) {
    return file;
  }

  let posts;

  try {
    posts = JSON.parse(file.content);
    if (!Array.isArray(posts)) posts = [];
  } catch (error) {
    return {
      ok: false,
      error: 'index.json tidak valid.'
    };
  }

  const originalLength = posts.length;

  posts = posts.filter(function(post) {
    return post.slug !== slug;
  });

  if (posts.length === originalLength) {
    return {
      ok: false,
      error: 'Artikel tidak ditemukan.'
    };
  }

  const result = githubUpdateFile(
    CONFIG.postsIndex,
    JSON.stringify(posts, null, 2),
    file.sha,
    'CMS: delete article ' + slug
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    message: 'Artikel berhasil dihapus.'
  };
}

/* =========================
   AI ARTICLE
========================= */

function generateAIArticle(prompt) {
  const apiKey = String(
    PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY') || ''
  ).trim();

  if (!apiKey) {
    return {
      ok: false,
      error: 'OPENAI_API_KEY belum dikonfigurasi di Script Properties.'
    };
  }

  const topic = String(prompt.topic || '').trim();

  if (!topic) {
    return {
      ok: false,
      error: 'Topik artikel wajib diisi.'
    };
  }

  const keyword = String(prompt.keyword || topic).trim();
  const language = String(prompt.language || 'Indonesia').trim();
  const style = String(prompt.style || 'edukasi').trim();
  const length = String(prompt.length || 'sedang').trim();

  const instruction = [
    'Buat artikel blog profesional untuk British Propolis Toili.',
    '',
    'Topik: ' + topic,
    'Keyword utama: ' + keyword,
    'Bahasa: ' + language,
    'Gaya: ' + style,
    'Panjang: ' + length,
    '',
    'Ketentuan:',
    '- SEO-friendly tetapi natural.',
    '- Gunakan bahasa yang mudah dibaca.',
    '- Jangan membuat klaim bahwa propolis dapat menyembuhkan penyakit.',
    '- Jangan membuat klaim medis yang tidak dapat dibuktikan.',
    '- Jangan mengarang fakta spesifik.',
    '- Buat judul, kategori, slug, excerpt, SEO description dan content HTML.',
    '',
    'Kembalikan HANYA JSON valid tanpa markdown code fence dengan struktur:',
    '{',
    '  "title": "...",',
    '  "category": "...",',
    '  "slug": "...",',
    '  "excerpt": "...",',
    '  "seo_description": "...",',
    '  "content": "<h2>...</h2><p>...</p>"',
    '}',
    '',
    'Content hanya boleh menggunakan HTML sederhana: h2, h3, p, ul, li, strong.'
  ].join('\n');

  const model = String(
    PropertiesService.getScriptProperties().getProperty('OPENAI_MODEL') || ''
  ).trim() || 'gpt-4.1-mini';

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + apiKey
    },
    payload: JSON.stringify({
      model: model,
      input: instruction
    }),
    muteHttpExceptions: true
  });

  const status = response.getResponseCode();
  const raw = response.getContentText();

  if (status < 200 || status >= 300) {
    return {
      ok: false,
      error: 'OpenAI API error ' + status + ': ' + raw
    };
  }

  let data;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      error: 'Respons OpenAI tidak valid.'
    };
  }

  let text = String(data.output_text || '');

  if (!text && Array.isArray(data.output)) {
    data.output.forEach(function(item) {
      if (!item || !Array.isArray(item.content)) return;

      item.content.forEach(function(part) {
        if (part && part.type === 'output_text' && part.text) {
          text += part.text;
        }
      });
    });
  }

  text = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!text) {
    return {
      ok: false,
      error: 'AI tidak mengembalikan artikel.'
    };
  }

  let article;

  try {
    article = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      error: 'Hasil AI bukan JSON valid.'
    };
  }

  article.date = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || 'Asia/Makassar',
    'yyyy-MM-dd'
  );

  article.image = article.image || '';

  return {
    ok: true,
    article: article
  };
}

/* =========================
   FACEBOOK
========================= */

function publishFacebook(slug) {
  if (!slug) {
    return {
      ok: false,
      error: 'Slug artikel tidak ada.'
    };
  }

  const file = githubGetFile(CONFIG.postsIndex);

  if (!file.ok) {
    return file;
  }

  let posts;

  try {
    posts = JSON.parse(file.content);
  } catch (error) {
    return {
      ok: false,
      error: 'index.json tidak valid.'
    };
  }

  const post = posts.find(function(item) {
    return item && item.slug === slug;
  });

  if (!post) {
    return {
      ok: false,
      error: 'Artikel tidak ditemukan.'
    };
  }

  const props = PropertiesService.getScriptProperties();
  const pageId = String(props.getProperty('FACEBOOK_PAGE_ID') || '').trim();
  const token = String(props.getProperty('FACEBOOK_PAGE_ACCESS_TOKEN') || '').trim();
  const version = String(props.getProperty('FACEBOOK_GRAPH_VERSION') || '').trim() || 'v23.0';

  if (!pageId || !token) {
    return {
      ok: false,
      error: 'FACEBOOK_PAGE_ID atau FACEBOOK_PAGE_ACCESS_TOKEN belum dikonfigurasi.'
    };
  }

  const url = CONFIG.siteUrl + 'artikel.html?slug=' + encodeURIComponent(post.slug);
  const endpoint = 'https://graph.facebook.com/' + version + '/' + pageId + '/feed';

  const message = [
    post.title,
    '',
    post.excerpt || '',
    '',
    'Baca selengkapnya: ' + url
  ].join('\n');

  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    payload: {
      message: message,
      link: url,
      access_token: token
    },
    muteHttpExceptions: true
  });

  const raw = response.getContentText();
  let data;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      error: 'Respons Facebook tidak valid.'
    };
  }

  if (response.getResponseCode() >= 300 || data.error) {
    return {
      ok: false,
      error: data.error && data.error.message
        ? data.error.message
        : 'Facebook publish gagal.'
    };
  }

  return {
    ok: true,
    message: 'Artikel berhasil dipublish ke Facebook Page.',
    id: data.id || ''
  };
}

/* =========================
   RESPONSE
========================= */

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
