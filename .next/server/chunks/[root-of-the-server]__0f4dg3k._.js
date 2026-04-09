module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},85148,(e,t,r)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},62294,e=>{"use strict";var t=e.i(85148);let r=e.i(14747).default.join(process.cwd(),"todos.db"),a=new t.default(r);a.pragma("journal_mode = WAL"),a.pragma("foreign_keys = ON"),a.exec(`
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
    `).all(e),findById:e=>a.prepare("SELECT * FROM todos WHERE id = ?").get(e),create(e){let t=a.prepare("INSERT INTO todos (user_id, title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.title,e.due_date??null,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null);return i.findById(t.lastInsertRowid)},update(e,t){let r=[],n=[];return void 0!==t.title&&(r.push("title = ?"),n.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),n.push(t.completed)),void 0!==t.due_date&&(r.push("due_date = ?"),n.push(t.due_date)),void 0!==t.priority&&(r.push("priority = ?"),n.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),n.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),n.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),n.push(t.reminder_minutes)),void 0!==t.last_notification_sent&&(r.push("last_notification_sent = ?"),n.push(t.last_notification_sent)),0===r.length||(n.push(e),a.prepare(`UPDATE todos SET ${r.join(", ")} WHERE id = ?`).run(...n)),i.findById(e)},delete(e){a.prepare("DELETE FROM todos WHERE id = ?").run(e)},findDueForNotification:()=>a.prepare(`
      SELECT * FROM todos
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND reminder_minutes IS NOT NULL
        AND (last_notification_sent IS NULL OR last_notification_sent < datetime(due_date, '-' || reminder_minutes || ' minutes', '+1 minute'))
        AND datetime('now') >= datetime(due_date, '-' || reminder_minutes || ' minutes')
        AND datetime('now') <= datetime(due_date, '+1 hour')
    `).all()},n={findByTodoId:e=>a.prepare("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY position, created_at").all(e),findById:e=>a.prepare("SELECT * FROM subtasks WHERE id = ?").get(e),create(e){let t=a.prepare("SELECT MAX(position) as max FROM subtasks WHERE todo_id = ?").get(e.todo_id).max??-1,r=a.prepare("INSERT INTO subtasks (todo_id, title, position) VALUES (?, ?, ?)").run(e.todo_id,e.title,e.position??t+1);return n.findById(r.lastInsertRowid)},update(e,t){let r=[],i=[];return void 0!==t.title&&(r.push("title = ?"),i.push(t.title)),void 0!==t.completed&&(r.push("completed = ?"),i.push(t.completed)),0===r.length||(i.push(e),a.prepare(`UPDATE subtasks SET ${r.join(", ")} WHERE id = ?`).run(...i)),n.findById(e)},delete(e){a.prepare("DELETE FROM subtasks WHERE id = ?").run(e)}},s={findByUserId:e=>a.prepare("SELECT * FROM tags WHERE user_id = ? ORDER BY name").all(e),findById:e=>a.prepare("SELECT * FROM tags WHERE id = ?").get(e),findByTodoId:e=>a.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `).all(e),create(e){let t=a.prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)").run(e.user_id,e.name.trim(),e.color??"#3B82F6");return s.findById(t.lastInsertRowid)},update(e,t){let r=[],i=[];return void 0!==t.name&&(r.push("name = ?"),i.push(t.name.trim())),void 0!==t.color&&(r.push("color = ?"),i.push(t.color)),0===r.length||(i.push(e),a.prepare(`UPDATE tags SET ${r.join(", ")} WHERE id = ?`).run(...i)),s.findById(e)},delete(e){a.prepare("DELETE FROM tags WHERE id = ?").run(e)},addToTodo(e,t){a.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,t)},removeFromTodo(e,t){a.prepare("DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?").run(e,t)},setTodoTags(e,t){for(let r of(a.prepare("DELETE FROM todo_tags WHERE todo_id = ?").run(e),t))a.prepare("INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").run(e,r)}},d={findByUserId:e=>a.prepare("SELECT * FROM templates WHERE user_id = ? ORDER BY name").all(e),findById:e=>a.prepare("SELECT * FROM templates WHERE id = ?").get(e),create(e){let t=a.prepare("INSERT INTO templates (user_id, name, description, category, title_template, priority, is_recurring, recurrence_pattern, reminder_minutes, subtasks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(e.user_id,e.name,e.description??null,e.category??null,e.title_template,e.priority??"medium",e.is_recurring??0,e.recurrence_pattern??null,e.reminder_minutes??null,e.subtasks_json??null);return d.findById(t.lastInsertRowid)},update(e,t){let r=[],i=[];return void 0!==t.name&&(r.push("name = ?"),i.push(t.name)),void 0!==t.description&&(r.push("description = ?"),i.push(t.description)),void 0!==t.category&&(r.push("category = ?"),i.push(t.category)),void 0!==t.title_template&&(r.push("title_template = ?"),i.push(t.title_template)),void 0!==t.priority&&(r.push("priority = ?"),i.push(t.priority)),void 0!==t.is_recurring&&(r.push("is_recurring = ?"),i.push(t.is_recurring)),void 0!==t.recurrence_pattern&&(r.push("recurrence_pattern = ?"),i.push(t.recurrence_pattern)),void 0!==t.reminder_minutes&&(r.push("reminder_minutes = ?"),i.push(t.reminder_minutes)),void 0!==t.subtasks_json&&(r.push("subtasks_json = ?"),i.push(t.subtasks_json)),0===r.length||(i.push(e),a.prepare(`UPDATE templates SET ${r.join(", ")} WHERE id = ?`).run(...i)),d.findById(e)},delete(e){a.prepare("DELETE FROM templates WHERE id = ?").run(e)}};e.s(["authenticatorDB",0,{create(e){a.prepare("INSERT INTO authenticators (user_id, credential_id, credential_public_key, counter, transports) VALUES (?, ?, ?, ?, ?)").run(e.user_id,e.credential_id,e.credential_public_key,e.counter??0,e.transports??null)},findByUserId:e=>a.prepare("SELECT * FROM authenticators WHERE user_id = ?").all(e),findByCredentialId:e=>a.prepare("SELECT * FROM authenticators WHERE credential_id = ?").get(e),updateCounter(e,t){a.prepare("UPDATE authenticators SET counter = ? WHERE id = ?").run(t,e)}},"holidayDB",0,{findByYear:e=>a.prepare("SELECT * FROM holidays WHERE year = ? ORDER BY date").all(e),findByYearRange:(e,t)=>a.prepare("SELECT * FROM holidays WHERE year >= ? AND year <= ? ORDER BY date").all(e,t),seed(e){let t=a.prepare("INSERT OR IGNORE INTO holidays (name, date, year) VALUES (?, ?, ?)");a.transaction(e=>{for(let r of e)t.run(r.name,r.date,r.year)})(e)},count:()=>a.prepare("SELECT COUNT(*) as count FROM holidays").get().count},"subtaskDB",0,n,"tagDB",0,s,"templateDB",0,d,"todoDB",0,i,"userDB",0,{findByUsername:e=>a.prepare("SELECT * FROM users WHERE username = ?").get(e),create:e=>({id:a.prepare("INSERT INTO users (username) VALUES (?)").run(e).lastInsertRowid,username:e,created_at:new Date().toISOString()}),findById:e=>a.prepare("SELECT * FROM users WHERE id = ?").get(e)}])},40890,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),i=e.i(59756),n=e.i(61916),s=e.i(74677),d=e.i(69741),o=e.i(16795),E=e.i(87718),u=e.i(95169),p=e.i(47587),l=e.i(66012),T=e.i(70101),R=e.i(26937),c=e.i(10372),N=e.i(93695);e.i(52474);var _=e.i(220),m=e.i(89171),y=e.i(62294);async function I(e){let{searchParams:t}=new URL(e.url),r=t.get("year"),a=r?parseInt(r):new Date().getFullYear(),i=y.holidayDB.findByYear(a);return m.NextResponse.json(i)}0===y.holidayDB.count()&&y.holidayDB.seed([{name:"New Year's Day",date:"2024-01-01",year:2024},{name:"Chinese New Year",date:"2024-02-10",year:2024},{name:"Chinese New Year",date:"2024-02-11",year:2024},{name:"Good Friday",date:"2024-03-29",year:2024},{name:"Hari Raya Puasa",date:"2024-04-10",year:2024},{name:"Labour Day",date:"2024-05-01",year:2024},{name:"Vesak Day",date:"2024-05-22",year:2024},{name:"Hari Raya Haji",date:"2024-06-17",year:2024},{name:"National Day",date:"2024-08-09",year:2024},{name:"Deepavali",date:"2024-10-31",year:2024},{name:"Christmas Day",date:"2024-12-25",year:2024},{name:"New Year's Day",date:"2025-01-01",year:2025},{name:"Chinese New Year",date:"2025-01-29",year:2025},{name:"Chinese New Year",date:"2025-01-30",year:2025},{name:"Hari Raya Puasa",date:"2025-03-31",year:2025},{name:"Good Friday",date:"2025-04-18",year:2025},{name:"Labour Day",date:"2025-05-01",year:2025},{name:"Vesak Day",date:"2025-05-12",year:2025},{name:"Hari Raya Haji",date:"2025-06-07",year:2025},{name:"National Day",date:"2025-08-09",year:2025},{name:"Deepavali",date:"2025-10-20",year:2025},{name:"Christmas Day",date:"2025-12-25",year:2025},{name:"New Year's Day",date:"2026-01-01",year:2026},{name:"Chinese New Year",date:"2026-02-17",year:2026},{name:"Chinese New Year",date:"2026-02-18",year:2026},{name:"Hari Raya Puasa",date:"2026-03-20",year:2026},{name:"Good Friday",date:"2026-04-03",year:2026},{name:"Labour Day",date:"2026-05-01",year:2026},{name:"Vesak Day",date:"2026-05-31",year:2026},{name:"Hari Raya Haji",date:"2026-05-27",year:2026},{name:"National Day",date:"2026-08-10",year:2026},{name:"Deepavali",date:"2026-11-08",year:2026},{name:"Christmas Day",date:"2026-12-25",year:2026}]),e.s(["GET",0,I],4716);var h=e.i(4716);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/holidays/route",pathname:"/api/holidays",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/holidays/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:A,workUnitAsyncStorage:S,serverHooks:g}=O;async function L(e,t,a){a.requestMeta&&(0,i.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/holidays/route";m=m.replace(/\/index$/,"")||"/";let y=await O.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,params:h,nextConfig:A,parsedUrl:S,isDraftMode:g,prerenderManifest:L,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:F,resolvedPathname:v,clientReferenceManifest:f,serverActionsManifest:U}=y,x=(0,d.normalizeAppPath)(m),w=!!(L.dynamicRoutes[x]||L.routes[v]),H=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,S,!1):t.end("This page could not be found"),null);if(w&&!g){let e=!!L.routes[v],t=L.dynamicRoutes[x];if(t&&!1===t.fallback&&!e){if(A.adapterPath)return await H();throw new N.NoFallbackError}}let B=null;!w||O.isDev||g||(B="/index"===(B=v)?"/":B);let X=!0===O.isDev||!w,b=w&&!X;U&&f&&(0,s.setManifestsSingleton)({page:m,clientReferenceManifest:f,serverActionsManifest:U});let M=e.method||"GET",k=(0,n.getTracer)(),Y=k.getActiveScopeSpan(),G=!!(null==C?void 0:C.isWrappedByNextServer),P=!!(0,i.getRequestMeta)(e,"minimalMode"),W=(0,i.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,A,L,P);null==W||W.resetRequestCache(),globalThis.__incrementalCache=W;let j={params:h,previewProps:L.preview,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:X,incrementalCache:W,cacheLifeProfiles:A.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,i)=>O.onRequestError(e,t,a,i,C)},sharedContext:{buildId:I}},q=new o.NodeNextRequest(e),K=new o.NodeNextResponse(t),V=E.NextRequestAdapter.fromNodeNextRequest(q,(0,E.signalFromNodeResponse)(t));try{let i,s=async e=>O.handle(V,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",a),i.updateName(t))}else e.updateName(`${M} ${m}`)}),d=async i=>{var n,d;let o=async({previousCacheEntry:r})=>{try{if(!P&&D&&F&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(i);e.fetchMetrics=j.renderOpts.fetchMetrics;let d=j.renderOpts.pendingWaitUntil;d&&a.waitUntil&&(a.waitUntil(d),d=void 0);let o=j.renderOpts.collectedTags;if(!w)return await (0,l.sendResponse)(q,K,n,j.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(n.headers);o&&(t[c.NEXT_CACHE_TAGS_HEADER]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=c.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,a=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=c.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:b,isOnDemandRevalidate:D})},!1,C),t}},E=await O.handleResponse({req:e,nextConfig:A,cacheKey:B,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:L,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:F,responseGenerator:o,waitUntil:a.waitUntil,isMinimalMode:P});if(!w)return null;if((null==E||null==(n=E.value)?void 0:n.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(d=E.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});P||t.setHeader("x-nextjs-cache",D?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),g&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,T.fromNodeOutgoingHttpHeaders)(E.value.headers);return P&&w||u.delete(c.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,R.getCacheControlHeader)(E.cacheControl)),await (0,l.sendResponse)(q,K,new Response(E.value.body,{headers:u,status:E.value.status||200})),null};G&&Y?await d(Y):(i=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(u.BaseServerSpan.handleRequest,{spanName:`${M} ${m}`,kind:n.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},d),void 0,!G))}catch(t){if(t instanceof N.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:b,isOnDemandRevalidate:D})},!1,C),w)throw t;return await (0,l.sendResponse)(q,K,new Response(null,{status:500})),null}}e.s(["handler",0,L,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:S})},"routeModule",0,O,"serverHooks",0,g,"workAsyncStorage",0,A,"workUnitAsyncStorage",0,S],40890)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0f4dg3k._.js.map