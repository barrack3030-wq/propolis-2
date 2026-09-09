const CONFIG = {
  repo: 'barrack3030-wq/propolis-2',
  branch: 'main',
  postsIndex: 'content/posts/index.json',
  siteUrl: 'https://agenbptoili.my.id/'
};

function doGet() { return json({ok:true,service:'British Propolis Toili Blog CMS',auth:'ready'}); }

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ok:false,error:'Request kosong'});
    const body = JSON.parse(e.postData.contents || '{}');
    const props = PropertiesService.getScriptProperties();
    const configuredKey = String(props.getProperty('CMS_API_KEY') || '').trim();
    const receivedKey = String(body.apiKey || '').trim();

    if (!configuredKey) return json({ok:false,error:'CMS_API_KEY belum dikonfigurasi di Script Properties.'});
    if (!receivedKey) return json({ok:false,error:'CMS API Key belum diisi di halaman CMS.'});
    if (receivedKey !== configuredKey) return json({ok:false,error:'CMS API Key salah. Pastikan nilainya sama persis dengan Script Properties.'});

    switch (body.action) {
      case 'list_posts': return listPosts();
      case 'save_post': return savePost(body.post);
      case 'delete_post': return deletePost(body.slug);
      case 'publish_facebook': return publishFacebook(body.slug);
      case 'generate_ai_article': return generateAIArticle(body.prompt || {});
      default: return json({ok:false,error:'Unknown action'});
    }
  } catch (err) { return json({ok:false,error:String(err)}); }
}

function githubHeaders_() { return {Authorization:'Bearer '+PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN'),Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}; }
function githubUrl_(path) { return 'https://api.github.com/repos/'+CONFIG.repo+'/contents/'+path+'?ref='+CONFIG.branch; }
function githubGet_(path) { return JSON.parse(UrlFetchApp.fetch(githubUrl_(path),{headers:githubHeaders_(),muteHttpExceptions:true}).getContentText()); }
function listPosts() { const x=githubGet_(CONFIG.postsIndex); if(!x.content)return json({ok:false,error:'Posts index not found'}); return json({ok:true,posts:JSON.parse(Utilities.newBlob(Utilities.base64Decode(x.content)).getDataAsString())}); }

function savePost(post) {
  if(!post || !post.slug || !post.title) return json({ok:false,error:'Slug dan judul wajib diisi'});
  const index=githubGet_(CONFIG.postsIndex); const posts=JSON.parse(Utilities.newBlob(Utilities.base64Decode(index.content)).getDataAsString());
  const clean={slug:post.slug,title:post.title,category:post.category||'Edukasi',date:post.date||new Date().toISOString().slice(0,10),image:post.image||'',excerpt:post.excerpt||'',content:post.content||''};
  const i=posts.findIndex(p=>p.slug===clean.slug); if(i>=0) posts[i]=clean; else posts.unshift(clean);
  putGithub_(CONFIG.postsIndex,JSON.stringify(posts,null,2),'Update blog posts index',index.sha);
  return json({ok:true,post:clean});
}

function deletePost(slug) { const index=githubGet_(CONFIG.postsIndex); const posts=JSON.parse(Utilities.newBlob(Utilities.base64Decode(index.content)).getDataAsString()).filter(p=>p.slug!==slug); putGithub_(CONFIG.postsIndex,JSON.stringify(posts,null,2),'Delete blog post',index.sha); return json({ok:true}); }

function putGithub_(path,content,message,sha) { const payload={message,content:Utilities.base64Encode(Utilities.newBlob(content,'application/json').getBytes()),branch:CONFIG.branch}; if(sha)payload.sha=sha; const r=UrlFetchApp.fetch('https://api.github.com/repos/'+CONFIG.repo+'/contents/'+path,{method:'put',headers:githubHeaders_(),contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true}); const out=JSON.parse(r.getContentText()); if(r.getResponseCode()>=300)throw Error(out.message||'GitHub error'); return out; }

function generateAIArticle(prompt) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('OPENAI_API_KEY');
  const model = props.getProperty('OPENAI_MODEL') || 'gpt-5.6-luna';
  if (!apiKey) return json({ok:false,error:'OPENAI_API_KEY belum diset di Script Properties.'});
  const topic = String(prompt.topic || '').trim();
  if (!topic) return json({ok:false,error:'Topik artikel wajib diisi.'});
  const language = prompt.language || 'Indonesia';
  const keyword = prompt.keyword || topic;
  const style = prompt.style || 'edukasi';
  const length = prompt.length || 'sedang';
  const instruction = `Buat artikel blog untuk British Propolis Toili.\nTopik: ${topic}\nKeyword utama: ${keyword}\nBahasa: ${language}\nGaya: ${style}\nPanjang: ${length}\n\nTulis artikel SEO-friendly tetapi natural. Jangan membuat klaim bahwa propolis atau produk tertentu dapat menyembuhkan penyakit. Jika membahas kesehatan, gunakan bahasa edukatif dan hati-hati. Jangan mengarang fakta spesifik yang tidak diperlukan.\n\nKembalikan HANYA JSON valid tanpa markdown code fence dengan struktur:\n{"title":"...","category":"...","slug":"...","excerpt":"...","seo_description":"...","content":"<h2>...</h2><p>...</p>"}\nContent harus berupa HTML sederhana menggunakan h2, h3, p, ul, li, dan strong bila diperlukan.`;
  const payload = {model:model,input:instruction,temperature:0.7};
  const response = UrlFetchApp.fetch('https://api.openai.com/v1/responses',{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+apiKey},payload:JSON.stringify(payload),muteHttpExceptions:true});
  const status=response.getResponseCode(); const raw=response.getContentText();
  if(status<200||status>=300)return json({ok:false,error:'OpenAI API error '+status+': '+raw});
  let data; try{data=JSON.parse(raw)}catch(err){return json({ok:false,error:'Respons OpenAI tidak valid: '+raw})}
  let text=data.output_text||'';
  if(!text&&data.output&&Array.isArray(data.output)){data.output.forEach(function(item){if(item&&item.content&&Array.isArray(item.content)){item.content.forEach(function(part){if(part&&part.type==='output_text'&&part.text)text+=part.text;});}});}
  if(!text)return json({ok:false,error:'AI tidak mengembalikan artikel.'});
  text=text.trim().replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/\s*```$/,'').trim();
  let article; try{article=JSON.parse(text)}catch(err){return json({ok:false,error:'Format hasil AI tidak valid: '+text})}
  article.date=new Date().toISOString().slice(0,10); article.image=''; return json({ok:true,article:article});
}

function publishFacebook(slug) {
  const index=githubGet_(CONFIG.postsIndex); const posts=JSON.parse(Utilities.newBlob(Utilities.base64Decode(index.content)).getDataAsString()); const p=posts.find(x=>x.slug===slug); if(!p)return json({ok:false,error:'Artikel tidak ditemukan'});
  const props=PropertiesService.getScriptProperties(); const pageId=props.getProperty('FACEBOOK_PAGE_ID'); const token=props.getProperty('FACEBOOK_PAGE_ACCESS_TOKEN'); const version=props.getProperty('FACEBOOK_GRAPH_VERSION')||'v23.0'; if(!pageId||!token)return json({ok:false,error:'Facebook credentials belum diatur'});
  const url=CONFIG.siteUrl+'artikel.html?slug='+encodeURIComponent(p.slug); const endpoint='https://graph.facebook.com/'+version+'/'+pageId+'/feed'; const r=UrlFetchApp.fetch(endpoint,{method:'post',payload:{message:p.title+'\n\n'+p.excerpt+'\n\nBaca selengkapnya: '+url,link:url,access_token:token},muteHttpExceptions:true}); const out=JSON.parse(r.getContentText()); if(out.error)return json({ok:false,error:out.error.message}); return json({ok:true,id:out.id});
}
function json(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}