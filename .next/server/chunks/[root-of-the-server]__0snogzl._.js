module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},85148,(e,t,r)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},62294,e=>{"use strict";var t=e.i(85148);let r=e.i(14747).default.join(process.cwd(),"todos.db"),a=new t.default(r);a.pragma("journal_mode = WAL"),a.pragma("foreign_keys = ON"),a.exec(`
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
`);let i={findByUserId:e=>a.prepare(`
      SELECT * FROM todos WHERE user_id = ?
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
        due_date ASC,
        created_at DESC
    `).all(e),findById:e=>a.prepare("SELECT * FROM todos WHERE id = ?").get(e),create(e){let t=a.prepare("INSERT INTO todos (user_id, title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.title,e.due_date??null,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null);return i.findById(t.lastInsertRowid)},update(e,t){let r=[],s=[];return void 0!==t.title&&(r.push("title = ?"),s.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),s.push(t.completed)),void 0!==t.due_date&&(r.push("due_date = ?"),s.push(t.due_date)),void 0!==t.priority&&(r.push("priority = ?"),s.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),s.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),s.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),s.push(t.reminder_minutes)),void 0!==t.last_notification_sent&&(r.push("last_notification_sent = ?"),s.push(t.last_notification_sent)),0===r.length||(s.push(e),a.prepare(`UPDATE todos SET ${r.join(", ")} WHERE id = ?`).run(...s)),i.findById(e)},delete(e){a.prepare("DELETE FROM todos WHERE id = ?").run(e)},findDueForNotification:()=>a.prepare(`
      SELECT * FROM todos
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND reminder_minutes IS NOT NULL
        AND (last_notification_sent IS NULL OR last_notification_sent < datetime(due_date, '-' || reminder_minutes || ' minutes', '+1 minute'))
        AND datetime('now') >= datetime(due_date, '-' || reminder_minutes || ' minutes')
        AND datetime('now') <= datetime(due_date, '+1 hour')
    `).all()},s={findByTodoId:e=>a.prepare("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY position, created_at").all(e),findById:e=>a.prepare("SELECT * FROM subtasks WHERE id = ?").get(e),create(e){let t=a.prepare("SELECT MAX(position) as max FROM subtasks WHERE todo_id = ?").get(e.todo_id).max??-1,r=a.prepare("INSERT INTO subtasks (todo_id, title, position) VALUES (?, ?, ?)").run(e.todo_id,e.title,e.position??t+1);return s.findById(r.lastInsertRowid)},update(e,t){let r=[],i=[];return void 0!==t.title&&(r.push("title = ?"),i.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),i.push(t.completed)),0===r.length||(i.push(e),a.prepare(`UPDATE subtasks SET ${r.join(", ")} WHERE id = ?`).run(...i)),s.findById(e)},delete(e){a.prepare("DELETE FROM subtasks WHERE id = ?").run(e)}},n={findByUserId:e=>a.prepare("SELECT * FROM tags WHERE user_id = ? ORDER BY name").all(e),findById:e=>a.prepare("SELECT * FROM tags WHERE id = ?").get(e),findByTodoId:e=>a.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `).all(e),create(e){let t=a.prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)").run(e.user_id,e.name.trim(),e.color??"#3B82F6");return n.findById(t.lastInsertRowid)},update(e,t){let r=[],i=[];return void 0!==t.name&&(r.push("name = ?"),i.push(t.name.trim())),void 0!==t.color&&(r.push("color = ?"),i.push(t.color)),0===r.length||(i.push(e),a.prepare(`UPDATE tags SET ${r.join(", ")} WHERE id = ?`).run(...i)),n.findById(e)},delete(e){a.prepare("DELETE FROM tags WHERE id = ?").run(e)},addToTodo(e,t){a.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,t)},removeFromTodo(e,t){a.prepare("DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?").run(e,t)},setTodoTags(e,t){for(let r of(a.prepare("DELETE FROM todo_tags WHERE todo_id = ?").run(e),t))a.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,r)}},o={findByUserId:e=>a.prepare("SELECT * FROM templates WHERE user_id = ? ORDER BY name").all(e),findById:e=>a.prepare("SELECT * FROM templates WHERE id = ?").get(e),create(e){let t=a.prepare("INSERT INTO templates (user_id, name, description, category, title_template, priority, is_recurring, recurrence_pattern, reminder_minutes, subtasks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.name,e.description??null,e.category??null,e.title_template,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null,e.subtasks_json??null);return o.findById(t.lastInsertRowid)},update(e,t){let r=[],i=[];return void 0!==t.name&&(r.push("name = ?"),i.push(t.name)),void 0!==t.description&&(r.push("description = ?"),i.push(t.description)),void 0!==t.category&&(r.push("category = ?"),i.push(t.category)),void 0!==t.title_template&&(r.push("title_template = ?"),i.push(t.title_template)),void 0!==t.priority&&(r.push("priority = ?"),i.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),i.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),i.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),i.push(t.reminder_minutes)),void 0!==t.subtasks_json&&(r.push("subtasks_json = ?"),i.push(t.subtasks_json)),0===r.length||(i.push(e),a.prepare(`UPDATE templates SET ${r.join(", ")} WHERE id = ?`).run(...i)),o.findById(e)},delete(e){a.prepare("DELETE FROM templates WHERE id = ?").run(e)}};e.s(["authenticatorDB",0,{create(e){a.prepare("INSERT INTO authenticators (user_id, credential_id, credential_public_key, counter, transports) VALUES (?, ?, ?, ?, ?)").run(e.user_id,e.credential_id,e.credential_public_key,e.counter??0,e.transports??null)},findByUserId:e=>a.prepare("SELECT * FROM authenticators WHERE user_id = ?").all(e),findByCredentialId:e=>a.prepare("SELECT * FROM authenticators WHERE credential_id = ?").get(e),updateCounter(e,t){a.prepare("UPDATE authenticators SET counter = ? WHERE id = ?").run(t,e)}},"holidayDB",0,{findByYear:e=>a.prepare("SELECT * FROM holidays WHERE year = ? ORDER BY date").all(e),findByYearRange:(e,t)=>a.prepare("SELECT * FROM holidays WHERE year >= ? AND year <= ? ORDER BY date").all(e,t),seed(e){let t=a.prepare("INSERT OR IGNORE INTO holidays (name, date, year) VALUES (?, ?, ?)");a.transaction(e=>{for(let r of e)t.run(r.name,r.date,r.year)})(e)},count:()=>a.prepare("SELECT COUNT(*) as count FROM holidays").get().count},"subtaskDB",0,s,"tagDB",0,n,"templateDB",0,o,"todoDB",0,i,"userDB",0,{findByUsername:e=>a.prepare("SELECT * FROM users WHERE username = ?").get(e),create:e=>({id:a.prepare("INSERT INTO users (username) VALUES (?)").run(e).lastInsertRowid,username:e,created_at:new Date().toISOString()}),findById:e=>a.prepare("SELECT * FROM users WHERE id = ?").get(e)}])},32618,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),i=e.i(59756),s=e.i(61916),n=e.i(74677),o=e.i(69741),d=e.i(16795),E=e.i(87718),u=e.i(95169),p=e.i(47587),l=e.i(66012),T=e.i(70101),c=e.i(26937),R=e.i(10372),N=e.i(93695);e.i(52474);var _=e.i(220),I=e.i(89171),m=e.i(68105),h=e.i(62294);async function O(e,{params:t}){let r=await (0,m.getSession)();if(!r)return I.NextResponse.json({error:"Not authenticated"},{status:401});let{id:a}=await t,i=h.todoDB.findById(parseInt(a));if(!i||i.user_id!==r.userId)return I.NextResponse.json({error:"Todo not found"},{status:404});try{let{tag_id:t}=await e.json();if(!t)return I.NextResponse.json({error:"tag_id is required"},{status:400});let i=h.tagDB.findById(t);if(!i||i.user_id!==r.userId)return I.NextResponse.json({error:"Tag not found"},{status:404});return h.tagDB.addToTodo(parseInt(a),t),I.NextResponse.json({success:!0})}catch(e){return console.error("Add tag to todo error:",e),I.NextResponse.json({error:"Failed to add tag"},{status:500})}}async function g(e,{params:t}){let r=await (0,m.getSession)();if(!r)return I.NextResponse.json({error:"Not authenticated"},{status:401});let{id:a}=await t,i=h.todoDB.findById(parseInt(a));if(!i||i.user_id!==r.userId)return I.NextResponse.json({error:"Todo not found"},{status:404});try{let{tag_id:t}=await e.json();if(!t)return I.NextResponse.json({error:"tag_id is required"},{status:400});return h.tagDB.removeFromTodo(parseInt(a),t),I.NextResponse.json({success:!0})}catch(e){return console.error("Remove tag from todo error:",e),I.NextResponse.json({error:"Failed to remove tag"},{status:500})}}e.s(["DELETE",0,g,"POST",0,O],18467);var A=e.i(18467);let S=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/todos/[id]/tags/route",pathname:"/api/todos/[id]/tags",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/todos/[id]/tags/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:L,workUnitAsyncStorage:C,serverHooks:y}=S;async function f(e,t,a){a.requestMeta&&(0,i.setRequestMeta)(e,a.requestMeta),S.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let I="/api/todos/[id]/tags/route";I=I.replace(/\/index$/,"")||"/";let m=await S.prepare(e,t,{srcPage:I,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:h,params:O,nextConfig:g,parsedUrl:A,isDraftMode:L,prerenderManifest:C,routerServerContext:y,isOnDemandRevalidate:f,revalidateOnlyGenerated:x,resolvedPathname:D,clientReferenceManifest:v,serverActionsManifest:F}=m,U=(0,o.normalizeAppPath)(I),w=!!(C.dynamicRoutes[U]||C.routes[D]),B=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,A,!1):t.end("This page could not be found"),null);if(w&&!L){let e=!!C.routes[D],t=C.dynamicRoutes[U];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await B();throw new N.NoFallbackError}}let X=null;!w||S.isDev||L||(X="/index"===(X=D)?"/":X);let M=!0===S.isDev||!w,b=w&&!M;F&&v&&(0,n.setManifestsSingleton)({page:I,clientReferenceManifest:v,serverActionsManifest:F});let H=e.method||"GET",j=(0,s.getTracer)(),k=j.getActiveScopeSpan(),P=!!(null==y?void 0:y.isWrappedByNextServer),G=!!(0,i.getRequestMeta)(e,"minimalMode"),W=(0,i.getRequestMeta)(e,"incrementalCache")||await S.getIncrementalCache(e,g,C,G);null==W||W.resetRequestCache(),globalThis.__incrementalCache=W;let Y={params:O,previewProps:C.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:M,incrementalCache:W,cacheLifeProfiles:g.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,i)=>S.onRequestError(e,t,a,i,y)},sharedContext:{buildId:h}},q=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),$=E.NextRequestAdapter.fromNodeNextRequest(q,(0,E.signalFromNodeResponse)(t));try{let i,n=async e=>S.handle($,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=j.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${H} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",a),i.updateName(t))}else e.updateName(`${H} ${I}`)}),o=async i=>{var s,o;let d=async({previousCacheEntry:r})=>{try{if(!G&&f&&x&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await n(i);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let d=Y.renderOpts.collectedTags;if(!w)return await (0,l.sendResponse)(q,K,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[R.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:b,isOnDemandRevalidate:f})},!1,y),t}},E=await S.handleResponse({req:e,nextConfig:g,cacheKey:X,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:x,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:G});if(!w)return null;if((null==E||null==(s=E.value)?void 0:s.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(o=E.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});G||t.setHeader("x-nextjs-cache",f?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),L&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(E.value.headers);return G&&w||u.delete(R.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,c.getCacheControlHeader)(E.cacheControl)),await (0,l.sendResponse)(q,K,new Response(E.value.body,{headers:u,status:E.value.status||200})),null};P&&k?await o(k):(i=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(u.BaseServerSpan.handleRequest,{spanName:`${H} ${I}`,kind:s.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},o),void 0,!P))}catch(t){if(t instanceof N.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:U,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:b,isOnDemandRevalidate:f})},!1,y),w)throw t;return await (0,l.sendResponse)(q,K,new Response(null,{status:500})),null}}e.s(["handler",0,f,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:L,workUnitAsyncStorage:C})},"routeModule",0,S,"serverHooks",0,y,"workAsyncStorage",0,L,"workUnitAsyncStorage",0,C],32618)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0snogzl._.js.map