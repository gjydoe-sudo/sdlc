module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},85148,(e,t,r)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},62294,e=>{"use strict";var t=e.i(85148);let r=e.i(14747).default.join(process.cwd(),"todos.db"),i=new t.default(r);i.pragma("journal_mode = WAL"),i.pragma("foreign_keys = ON"),i.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS authenticators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    credential_id TEXT NOT NULL,
    credential_public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    transports TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    reminder_minutes INTEGER,
    last_notification_sent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS todo_tags (
    todo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    title_template TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    reminder_minutes INTEGER,
    subtasks_json TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    year INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
  CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
  CREATE INDEX IF NOT EXISTS idx_subtasks_todo_id ON subtasks(todo_id);
  CREATE INDEX IF NOT EXISTS idx_todo_tags_todo_id ON todo_tags(todo_id);
  CREATE INDEX IF NOT EXISTS idx_todo_tags_tag_id ON todo_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
  CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
  CREATE INDEX IF NOT EXISTS idx_authenticators_user_id ON authenticators(user_id);
  CREATE INDEX IF NOT EXISTS idx_holidays_year ON holidays(year);
`);let a={findByUserId:e=>i.prepare(`
      SELECT * FROM todos WHERE user_id = ?
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
        due_date ASC,
        created_at DESC
    `).all(e),findById:e=>i.prepare("SELECT * FROM todos WHERE id = ?").get(e),create(e){let t=i.prepare("INSERT INTO todos (user_id, title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.title,e.due_date??null,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null);return a.findById(t.lastInsertRowid)},update(e,t){let r=[],s=[];return void 0!==t.title&&(r.push("title = ?"),s.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),s.push(t.completed)),void 0!==t.due_date&&(r.push("due_date = ?"),s.push(t.due_date)),void 0!==t.priority&&(r.push("priority = ?"),s.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),s.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),s.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),s.push(t.reminder_minutes)),void 0!==t.last_notification_sent&&(r.push("last_notification_sent = ?"),s.push(t.last_notification_sent)),0===r.length||(s.push(e),i.prepare(`UPDATE todos SET ${r.join(", ")} WHERE id = ?`).run(...s)),a.findById(e)},delete(e){i.prepare("DELETE FROM todos WHERE id = ?").run(e)},findDueForNotification:()=>i.prepare(`
      SELECT * FROM todos
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND reminder_minutes IS NOT NULL
        AND (last_notification_sent IS NULL OR last_notification_sent < datetime(due_date, '-' || reminder_minutes || ' minutes', '+1 minute'))
        AND datetime('now') >= datetime(due_date, '-' || reminder_minutes || ' minutes')
        AND datetime('now') <= datetime(due_date, '+1 hour')
    `).all()},s={findByTodoId:e=>i.prepare("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY position, created_at").all(e),findById:e=>i.prepare("SELECT * FROM subtasks WHERE id = ?").get(e),create(e){let t=i.prepare("SELECT MAX(position) as max FROM subtasks WHERE todo_id = ?").get(e.todo_id).max??-1,r=i.prepare("INSERT INTO subtasks (todo_id, title, position) VALUES (?, ?, ?)").run(e.todo_id,e.title,e.position??t+1);return s.findById(r.lastInsertRowid)},update(e,t){let r=[],a=[];return void 0!==t.title&&(r.push("title = ?"),a.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),a.push(t.completed)),0===r.length||(a.push(e),i.prepare(`UPDATE subtasks SET ${r.join(", ")} WHERE id = ?`).run(...a)),s.findById(e)},delete(e){i.prepare("DELETE FROM subtasks WHERE id = ?").run(e)}},n={findByUserId:e=>i.prepare("SELECT * FROM tags WHERE user_id = ? ORDER BY name").all(e),findById:e=>i.prepare("SELECT * FROM tags WHERE id = ?").get(e),findByTodoId:e=>i.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `).all(e),create(e){let t=i.prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)").run(e.user_id,e.name.trim(),e.color??"#3B82F6");return n.findById(t.lastInsertRowid)},update(e,t){let r=[],a=[];return void 0!==t.name&&(r.push("name = ?"),a.push(t.name.trim())),void 0!==t.color&&(r.push("color = ?"),a.push(t.color)),0===r.length||(a.push(e),i.prepare(`UPDATE tags SET ${r.join(", ")} WHERE id = ?`).run(...a)),n.findById(e)},delete(e){i.prepare("DELETE FROM tags WHERE id = ?").run(e)},addToTodo(e,t){i.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,t)},removeFromTodo(e,t){i.prepare("DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?").run(e,t)},setTodoTags(e,t){for(let r of(i.prepare("DELETE FROM todo_tags WHERE todo_id = ?").run(e),t))i.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,r)}},o={findByUserId:e=>i.prepare("SELECT * FROM templates WHERE user_id = ? ORDER BY name").all(e),findById:e=>i.prepare("SELECT * FROM templates WHERE id = ?").get(e),create(e){let t=i.prepare("INSERT INTO templates (user_id, name, description, category, title_template, priority, is_recurring, recurrence_pattern, reminder_minutes, subtasks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.name,e.description??null,e.category??null,e.title_template,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null,e.subtasks_json??null);return o.findById(t.lastInsertRowid)},update(e,t){let r=[],a=[];return void 0!==t.name&&(r.push("name = ?"),a.push(t.name)),void 0!==t.description&&(r.push("description = ?"),a.push(t.description)),void 0!==t.category&&(r.push("category = ?"),a.push(t.category)),void 0!==t.title_template&&(r.push("title_template = ?"),a.push(t.title_template)),void 0!==t.priority&&(r.push("priority = ?"),a.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),a.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),a.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),a.push(t.reminder_minutes)),void 0!==t.subtasks_json&&(r.push("subtasks_json = ?"),a.push(t.subtasks_json)),0===r.length||(a.push(e),i.prepare(`UPDATE templates SET ${r.join(", ")} WHERE id = ?`).run(...a)),o.findById(e)},delete(e){i.prepare("DELETE FROM templates WHERE id = ?").run(e)}};e.s(["authenticatorDB",0,{create(e){i.prepare("INSERT INTO authenticators (user_id, credential_id, credential_public_key, counter, transports) VALUES (?, ?, ?, ?, ?)").run(e.user_id,e.credential_id,e.credential_public_key,e.counter??0,e.transports??null)},findByUserId:e=>i.prepare("SELECT * FROM authenticators WHERE user_id = ?").all(e),findByCredentialId:e=>i.prepare("SELECT * FROM authenticators WHERE credential_id = ?").get(e),updateCounter(e,t){i.prepare("UPDATE authenticators SET counter = ? WHERE id = ?").run(t,e)}},"holidayDB",0,{findByYear:e=>i.prepare("SELECT * FROM holidays WHERE year = ? ORDER BY date").all(e),findByYearRange:(e,t)=>i.prepare("SELECT * FROM holidays WHERE year >= ? AND year <= ? ORDER BY date").all(e,t),seed(e){let t=i.prepare("INSERT OR IGNORE INTO holidays (name, date, year) VALUES (?, ?, ?)");i.transaction(e=>{for(let r of e)t.run(r.name,r.date,r.year)})(e)},count:()=>i.prepare("SELECT COUNT(*) as count FROM holidays").get().count},"subtaskDB",0,s,"tagDB",0,n,"templateDB",0,o,"todoDB",0,a,"userDB",0,{findByUsername:e=>i.prepare("SELECT * FROM users WHERE username = ?").get(e),create:e=>({id:i.prepare("INSERT INTO users (username) VALUES (?)").run(e).lastInsertRowid,username:e,created_at:new Date().toISOString()}),findById:e=>i.prepare("SELECT * FROM users WHERE id = ?").get(e)}])},34845,e=>{"use strict";var t=e.i(47909),r=e.i(74017),i=e.i(96250),a=e.i(59756),s=e.i(61916),n=e.i(74677),o=e.i(69741),d=e.i(16795),E=e.i(87718),u=e.i(95169),p=e.i(47587),l=e.i(66012),T=e.i(70101),c=e.i(26937),R=e.i(10372),_=e.i(93695);e.i(52474);var N=e.i(220),I=e.i(89171),m=e.i(68105),h=e.i(62294);async function O(e,{params:t}){let r=await (0,m.getSession)();if(!r)return I.NextResponse.json({error:"Not authenticated"},{status:401});let{id:i}=await t,a=h.todoDB.findById(parseInt(i));return a&&a.user_id===r.userId?I.NextResponse.json({...a,subtasks:h.subtaskDB.findByTodoId(a.id),tags:h.tagDB.findByTodoId(a.id)}):I.NextResponse.json({error:"Todo not found"},{status:404})}async function g(e,{params:t}){let r=await (0,m.getSession)();if(!r)return I.NextResponse.json({error:"Not authenticated"},{status:401});let{id:i}=await t,a=parseInt(i),s=h.todoDB.findById(a);if(!s||s.user_id!==r.userId)return I.NextResponse.json({error:"Todo not found"},{status:404});try{let{tag_ids:t,...i}=await e.json();if(i.priority&&!["high","medium","low"].includes(i.priority))return I.NextResponse.json({error:"Invalid priority"},{status:400});if(1===i.completed&&0===s.completed&&s.is_recurring&&s.due_date&&s.recurrence_pattern){let e=function(e,t){let r=new Date(e);switch(t){case"daily":r.setDate(r.getDate()+1);break;case"weekly":r.setDate(r.getDate()+7);break;case"monthly":r.setMonth(r.getMonth()+1);break;case"yearly":r.setFullYear(r.getFullYear()+1)}return r.toISOString()}(s.due_date,s.recurrence_pattern),t=h.subtaskDB.findByTodoId(a),i=h.tagDB.findByTodoId(a),n=h.todoDB.create({user_id:r.userId,title:s.title,due_date:e,priority:s.priority,is_recurring:1,recurrence_pattern:s.recurrence_pattern,reminder_minutes:s.reminder_minutes});for(let e of t)h.subtaskDB.create({todo_id:n.id,title:e.title});i.length>0&&h.tagDB.setTodoTags(n.id,i.map(e=>e.id))}Array.isArray(t)&&h.tagDB.setTodoTags(a,t);let n=h.todoDB.update(a,i);return I.NextResponse.json({...n,subtasks:h.subtaskDB.findByTodoId(a),tags:h.tagDB.findByTodoId(a)})}catch(e){return console.error("Update todo error:",e),I.NextResponse.json({error:"Failed to update todo"},{status:500})}}async function A(e,{params:t}){let r=await (0,m.getSession)();if(!r)return I.NextResponse.json({error:"Not authenticated"},{status:401});let{id:i}=await t,a=h.todoDB.findById(parseInt(i));return a&&a.user_id===r.userId?(h.todoDB.delete(parseInt(i)),I.NextResponse.json({success:!0})):I.NextResponse.json({error:"Todo not found"},{status:404})}e.s(["DELETE",0,A,"GET",0,O,"PUT",0,g],60251);var S=e.i(60251);let y=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/todos/[id]/route",pathname:"/api/todos/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/todos/[id]/route.ts",nextConfigOutput:"",userland:S,...{}}),{workAsyncStorage:L,workUnitAsyncStorage:D,serverHooks:f}=y;async function C(e,t,i){i.requestMeta&&(0,a.setRequestMeta)(e,i.requestMeta),y.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let I="/api/todos/[id]/route";I=I.replace(/\/index$/,"")||"/";let m=await y.prepare(e,t,{srcPage:I,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve()),null;let{buildId:h,params:O,nextConfig:g,parsedUrl:A,isDraftMode:S,prerenderManifest:L,routerServerContext:D,isOnDemandRevalidate:f,revalidateOnlyGenerated:C,resolvedPathname:x,clientReferenceManifest:F,serverActionsManifest:U}=m,v=(0,o.normalizeAppPath)(I),B=!!(L.dynamicRoutes[v]||L.routes[x]),w=async()=>((null==D?void 0:D.render404)?await D.render404(e,t,A,!1):t.end("This page could not be found"),null);if(B&&!S){let e=!!L.routes[x],t=L.dynamicRoutes[v];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await w();throw new _.NoFallbackError}}let b=null;!B||y.isDev||S||(b="/index"===(b=x)?"/":b);let M=!0===y.isDev||!B,X=B&&!M;U&&F&&(0,n.setManifestsSingleton)({page:I,clientReferenceManifest:F,serverActionsManifest:U});let k=e.method||"GET",H=(0,s.getTracer)(),j=H.getActiveScopeSpan(),P=!!(null==D?void 0:D.isWrappedByNextServer),G=!!(0,a.getRequestMeta)(e,"minimalMode"),W=(0,a.getRequestMeta)(e,"incrementalCache")||await y.getIncrementalCache(e,g,L,G);null==W||W.resetRequestCache(),globalThis.__incrementalCache=W;let Y={params:O,previewProps:L.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:M,incrementalCache:W,cacheLifeProfiles:g.cacheLife,waitUntil:i.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,i,a)=>y.onRequestError(e,t,i,a,D)},sharedContext:{buildId:h}},q=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),$=E.NextRequestAdapter.fromNodeNextRequest(q,(0,E.signalFromNodeResponse)(t));try{let a,n=async e=>y.handle($,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=H.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=r.get("next.route");if(i){let t=`${k} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",i),a.updateName(t))}else e.updateName(`${k} ${I}`)}),o=async a=>{var s,o;let d=async({previousCacheEntry:r})=>{try{if(!G&&f&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await n(a);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&i.waitUntil&&(i.waitUntil(o),o=void 0);let d=Y.renderOpts.collectedTags;if(!B)return await (0,l.sendResponse)(q,K,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[R.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,i=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:i}}}}catch(t){throw(null==r?void 0:r.isStale)&&await y.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:f})},!1,D),t}},E=await y.handleResponse({req:e,nextConfig:g,cacheKey:b,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:L,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:C,responseGenerator:d,waitUntil:i.waitUntil,isMinimalMode:G});if(!B)return null;if((null==E||null==(s=E.value)?void 0:s.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(o=E.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});G||t.setHeader("x-nextjs-cache",f?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(E.value.headers);return G&&B||u.delete(R.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,c.getCacheControlHeader)(E.cacheControl)),await (0,l.sendResponse)(q,K,new Response(E.value.body,{headers:u,status:E.value.status||200})),null};P&&j?await o(j):(a=H.getActiveScopeSpan(),await H.withPropagatedContext(e.headers,()=>H.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${I}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!P))}catch(t){if(t instanceof _.NoFallbackError||await y.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:f})},!1,D),B)throw t;return await (0,l.sendResponse)(q,K,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:L,workUnitAsyncStorage:D})},"routeModule",0,y,"serverHooks",0,f,"workAsyncStorage",0,L,"workUnitAsyncStorage",0,D],34845)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0u7971u._.js.map