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
    `).all()},s={findByTodoId:e=>i.prepare("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY position, created_at").all(e),findById:e=>i.prepare("SELECT * FROM subtasks WHERE id = ?").get(e),create(e){let t=i.prepare("SELECT MAX(position) as max FROM subtasks WHERE todo_id = ?").get(e.todo_id).max??-1,r=i.prepare("INSERT INTO subtasks (todo_id, title, position) VALUES (?, ?, ?)").run(e.todo_id,e.title,e.position??t+1);return s.findById(r.lastInsertRowid)},update(e,t){let r=[],a=[];return void 0!==t.title&&(r.push("title = ?"),a.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),a.push(t.completed)),0===r.length||(a.push(e),i.prepare(`UPDATE subtasks SET ${r.join(", ")} WHERE id = ?`).run(...a)),s.findById(e)},delete(e){i.prepare("DELETE FROM subtasks WHERE id = ?").run(e)}},o={findByUserId:e=>i.prepare("SELECT * FROM tags WHERE user_id = ? ORDER BY name").all(e),findById:e=>i.prepare("SELECT * FROM tags WHERE id = ?").get(e),findByTodoId:e=>i.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `).all(e),create(e){let t=i.prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)").run(e.user_id,e.name.trim(),e.color??"#3B82F6");return o.findById(t.lastInsertRowid)},update(e,t){let r=[],a=[];return void 0!==t.name&&(r.push("name = ?"),a.push(t.name.trim())),void 0!==t.color&&(r.push("color = ?"),a.push(t.color)),0===r.length||(a.push(e),i.prepare(`UPDATE tags SET ${r.join(", ")} WHERE id = ?`).run(...a)),o.findById(e)},delete(e){i.prepare("DELETE FROM tags WHERE id = ?").run(e)},addToTodo(e,t){i.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,t)},removeFromTodo(e,t){i.prepare("DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?").run(e,t)},setTodoTags(e,t){for(let r of(i.prepare("DELETE FROM todo_tags WHERE todo_id = ?").run(e),t))i.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,r)}},n={findByUserId:e=>i.prepare("SELECT * FROM templates WHERE user_id = ? ORDER BY name").all(e),findById:e=>i.prepare("SELECT * FROM templates WHERE id = ?").get(e),create(e){let t=i.prepare("INSERT INTO templates (user_id, name, description, category, title_template, priority, is_recurring, recurrence_pattern, reminder_minutes, subtasks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.name,e.description??null,e.category??null,e.title_template,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null,e.subtasks_json??null);return n.findById(t.lastInsertRowid)},update(e,t){let r=[],a=[];return void 0!==t.name&&(r.push("name = ?"),a.push(t.name)),void 0!==t.description&&(r.push("description = ?"),a.push(t.description)),void 0!==t.category&&(r.push("category = ?"),a.push(t.category)),void 0!==t.title_template&&(r.push("title_template = ?"),a.push(t.title_template)),void 0!==t.priority&&(r.push("priority = ?"),a.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),a.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),a.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),a.push(t.reminder_minutes)),void 0!==t.subtasks_json&&(r.push("subtasks_json = ?"),a.push(t.subtasks_json)),0===r.length||(a.push(e),i.prepare(`UPDATE templates SET ${r.join(", ")} WHERE id = ?`).run(...a)),n.findById(e)},delete(e){i.prepare("DELETE FROM templates WHERE id = ?").run(e)}};e.s(["authenticatorDB",0,{create(e){i.prepare("INSERT INTO authenticators (user_id, credential_id, credential_public_key, counter, transports) VALUES (?, ?, ?, ?, ?)").run(e.user_id,e.credential_id,e.credential_public_key,e.counter??0,e.transports??null)},findByUserId:e=>i.prepare("SELECT * FROM authenticators WHERE user_id = ?").all(e),findByCredentialId:e=>i.prepare("SELECT * FROM authenticators WHERE credential_id = ?").get(e),updateCounter(e,t){i.prepare("UPDATE authenticators SET counter = ? WHERE id = ?").run(t,e)}},"holidayDB",0,{findByYear:e=>i.prepare("SELECT * FROM holidays WHERE year = ? ORDER BY date").all(e),findByYearRange:(e,t)=>i.prepare("SELECT * FROM holidays WHERE year >= ? AND year <= ? ORDER BY date").all(e,t),seed(e){let t=i.prepare("INSERT OR IGNORE INTO holidays (name, date, year) VALUES (?, ?, ?)");i.transaction(e=>{for(let r of e)t.run(r.name,r.date,r.year)})(e)},count:()=>i.prepare("SELECT COUNT(*) as count FROM holidays").get().count},"subtaskDB",0,s,"tagDB",0,o,"templateDB",0,n,"todoDB",0,a,"userDB",0,{findByUsername:e=>i.prepare("SELECT * FROM users WHERE username = ?").get(e),create:e=>({id:i.prepare("INSERT INTO users (username) VALUES (?)").run(e).lastInsertRowid,username:e,created_at:new Date().toISOString()}),findById:e=>i.prepare("SELECT * FROM users WHERE id = ?").get(e)}])},70043,e=>{"use strict";var t=e.i(47909),r=e.i(74017),i=e.i(96250),a=e.i(59756),s=e.i(61916),o=e.i(74677),n=e.i(69741),d=e.i(16795),E=e.i(87718),u=e.i(95169),p=e.i(47587),l=e.i(66012),T=e.i(70101),c=e.i(26937),R=e.i(10372),_=e.i(93695);e.i(52474);var N=e.i(220),m=e.i(89171),I=e.i(68105),h=e.i(62294);async function O(e){let t=await (0,I.getSession)();if(!t)return m.NextResponse.json({error:"Not authenticated"},{status:401});try{let r=await e.json();if(!r||void 0===r.version||!Array.isArray(r.todos))return m.NextResponse.json({error:"Invalid import format"},{status:400});let i=new Map;for(let e of h.tagDB.findByUserId(t.userId))i.set(e.name.toLowerCase(),e.id);if(Array.isArray(r.tags))for(let e of r.tags){if(!e.name)continue;let r=e.name.toLowerCase();if(!i.has(r)){let a=h.tagDB.create({user_id:t.userId,name:e.name,color:e.color});i.set(r,a.id)}}let a=0,s=0;for(let e of r.todos){if(!e.title)continue;let r=h.todoDB.create({user_id:t.userId,title:e.title,due_date:e.due_date??null,priority:e.priority??"medium",is_recurring:e.is_recurring??0,recurrence_pattern:e.recurrence_pattern??null,reminder_minutes:e.reminder_minutes??null});if(e.completed&&h.todoDB.update(r.id,{completed:1}),Array.isArray(e.subtasks))for(let t of e.subtasks){if(!t.title)continue;let e=h.subtaskDB.create({todo_id:r.id,title:t.title});t.completed&&h.subtaskDB.update(e.id,{completed:1}),s++}if(Array.isArray(e.tags)&&e.tags.length>0){let t=e.tags.map(e=>i.get(e.toLowerCase())).filter(e=>void 0!==e);t.length>0&&h.tagDB.setTodoTags(r.id,t)}a++}return m.NextResponse.json({success:!0,imported:{todos:a,subtasks:s}})}catch(e){return console.error("Import error:",e),m.NextResponse.json({error:"Failed to import todos. Check file format."},{status:400})}}e.s(["POST",0,O],66145);var A=e.i(66145);let g=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/todos/import/route",pathname:"/api/todos/import",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/todos/import/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:S,workUnitAsyncStorage:L,serverHooks:y}=g;async function C(e,t,i){i.requestMeta&&(0,a.setRequestMeta)(e,i.requestMeta),g.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/todos/import/route";m=m.replace(/\/index$/,"")||"/";let I=await g.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!I)return t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve()),null;let{buildId:h,params:O,nextConfig:A,parsedUrl:S,isDraftMode:L,prerenderManifest:y,routerServerContext:C,isOnDemandRevalidate:f,revalidateOnlyGenerated:D,resolvedPathname:x,clientReferenceManifest:v,serverActionsManifest:U}=I,F=(0,n.normalizeAppPath)(m),w=!!(y.dynamicRoutes[F]||y.routes[x]),B=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,S,!1):t.end("This page could not be found"),null);if(w&&!L){let e=!!y.routes[x],t=y.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(A.adapterPath)return await B();throw new _.NoFallbackError}}let b=null;!w||g.isDev||L||(b="/index"===(b=x)?"/":b);let X=!0===g.isDev||!w,M=w&&!X;U&&v&&(0,o.setManifestsSingleton)({page:m,clientReferenceManifest:v,serverActionsManifest:U});let H=e.method||"GET",k=(0,s.getTracer)(),P=k.getActiveScopeSpan(),G=!!(null==C?void 0:C.isWrappedByNextServer),W=!!(0,a.getRequestMeta)(e,"minimalMode"),j=(0,a.getRequestMeta)(e,"incrementalCache")||await g.getIncrementalCache(e,A,y,W);null==j||j.resetRequestCache(),globalThis.__incrementalCache=j;let Y={params:O,previewProps:y.preview,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:X,incrementalCache:j,cacheLifeProfiles:A.cacheLife,waitUntil:i.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,i,a)=>g.onRequestError(e,t,i,a,C)},sharedContext:{buildId:h}},q=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),$=E.NextRequestAdapter.fromNodeNextRequest(q,(0,E.signalFromNodeResponse)(t));try{let a,o=async e=>g.handle($,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=r.get("next.route");if(i){let t=`${H} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",i),a.updateName(t))}else e.updateName(`${H} ${m}`)}),n=async a=>{var s,n;let d=async({previousCacheEntry:r})=>{try{if(!W&&f&&D&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(a);e.fetchMetrics=Y.renderOpts.fetchMetrics;let n=Y.renderOpts.pendingWaitUntil;n&&i.waitUntil&&(i.waitUntil(n),n=void 0);let d=Y.renderOpts.collectedTags;if(!w)return await (0,l.sendResponse)(q,K,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[R.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,i=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:i}}}}catch(t){throw(null==r?void 0:r.isStale)&&await g.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:f})},!1,C),t}},E=await g.handleResponse({req:e,nextConfig:A,cacheKey:b,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:D,responseGenerator:d,waitUntil:i.waitUntil,isMinimalMode:W});if(!w)return null;if((null==E||null==(s=E.value)?void 0:s.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(n=E.value)?void 0:n.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});W||t.setHeader("x-nextjs-cache",f?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),L&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(E.value.headers);return W&&w||u.delete(R.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,c.getCacheControlHeader)(E.cacheControl)),await (0,l.sendResponse)(q,K,new Response(E.value.body,{headers:u,status:E.value.status||200})),null};G&&P?await n(P):(a=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(u.BaseServerSpan.handleRequest,{spanName:`${H} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},n),void 0,!G))}catch(t){if(t instanceof _.NoFallbackError||await g.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:f})},!1,C),w)throw t;return await (0,l.sendResponse)(q,K,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:S,workUnitAsyncStorage:L})},"routeModule",0,g,"serverHooks",0,y,"workAsyncStorage",0,S,"workUnitAsyncStorage",0,L],70043)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0j_k494._.js.map