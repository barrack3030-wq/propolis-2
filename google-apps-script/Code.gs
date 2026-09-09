const CONFIG = {
  repo: 'barrack3030-wq/propolis-2',
  branch: 'main',
  postsIndex: 'content/posts/index.json',
  siteUrl: 'https://agenbptoili.my.id/'
};

function doGet() { return json({ok:true,service:'British Propolis Toili Blog CMS'}); }

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.apiKey !== PropertiesService.getScriptProperties().getProperty('CMS_API_KEY')) return json({ok:false,error:'Unauthorized'});
    switch (body.action) {
      case 'list_posts': return listPosts();
      case 'save_post': return savePost(body.post);
      case 'delete_post': return deletePost(body.slug);
      case 'publish_facebook': return publishFacebook(body.slug);
      default: return json({ok:false,error:'Unknown action'});
    }
  } catch (err) { return json({ok:false,error:String(err)}); }
}

function githubHeaders_() { return {Authorization:'Bearer '+PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN'),Accept:'application/vnd.github+json'}; }
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

function putGithub_(path,content,message,sha) { const payload={message,content:Utilities.base64Encode(content,Utilities.Charset.UTF_8),branch:CONFIG.branch}; if(sha)payload.sha=sha; const r=UrlFetchApp.fetch('https://api.github.com/repos/'+CONFIG.repo+'/contents/'+path,{method:'put',headers:githubHeaders_(),contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true}); const out=JSON.parse(r.getContentText()); if(r.getResponseCode()>=300)throw Error(out.message||'GitHub error'); return out; }

function publishFacebook(slug) {
  const index=githubGet_(CONFIG.postsIndex); const posts=JSON.parse(Utilities.newBlob(Utilities.base64Decode(index.content)).getDataAsString()); const p=posts.find(x=>x.slug===slug); if(!p) return json({ok:false,error:'Artikel tidak ditemukan'});
  const props=PropertiesService.getScriptProperties(); const pageId=props.getProperty('FACEBOOK_PAGE_ID'); const token=props.getProperty('FACEBOOK_PAGE_ACCESS_TOKEN'); const version=props.getProperty('FACEBOOK_GRAPH_VERSION')||'v23.0'; if(!pageId||!token)return json({ok:false,error:'Facebook credentials belum diatur'});
  const url=CONFIG.siteUrl+'artikel.html?slug='+encodeURIComponent(p.slug); const endpoint='https://graph.facebook.com/'+version+'/'+pageId+'/feed'; const r=UrlFetchApp.fetch(endpoint,{method:'post',payload:{message:p.title+'\n\n'+p.excerpt+'\n\nBaca selengkapnya: '+url,link:url,access_token:token},muteHttpExceptions:true}); const out=JSON.parse(r.getContentText()); if(out.error)return json({ok:false,error:out.error.message}); return json({ok:true,id:out.id});
}
function json(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}
