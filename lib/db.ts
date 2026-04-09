import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'todos.db')

const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
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
`)

export type Priority = 'high' | 'medium' | 'low'
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface User {
  id: number
  username: string
  created_at: string
}

export interface Authenticator {
  id: number
  user_id: number
  credential_id: string
  credential_public_key: string
  counter: number
  transports: string | null
  created_at: string
}

export interface Todo {
  id: number
  user_id: number
  title: string
  completed: number
  due_date: string | null
  priority: Priority
  is_recurring: number
  recurrence_pattern: RecurrencePattern | null
  reminder_minutes: number | null
  last_notification_sent: string | null
  created_at: string
}

export interface Subtask {
  id: number
  todo_id: number
  title: string
  completed: number
  position: number
  created_at: string
}

export interface Tag {
  id: number
  user_id: number
  name: string
  color: string
  created_at: string
}

export interface Template {
  id: number
  user_id: number
  name: string
  description: string | null
  category: string | null
  title_template: string
  priority: Priority
  is_recurring: number
  recurrence_pattern: RecurrencePattern | null
  reminder_minutes: number | null
  subtasks_json: string | null
  created_at: string
}

export interface Holiday {
  id: number
  name: string
  date: string
  year: number
}

export const userDB = {
  findByUsername(username: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined
  },

  create(username: string): User {
    const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(username)
    return { id: result.lastInsertRowid as number, username, created_at: new Date().toISOString() }
  },

  findById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined
  }
}

export const authenticatorDB = {
  create(data: { user_id: number; credential_id: string; credential_public_key: string; counter: number; transports?: string }): void {
    db.prepare(
      'INSERT INTO authenticators (user_id, credential_id, credential_public_key, counter, transports) VALUES (?, ?, ?, ?, ?)'
    ).run(data.user_id, data.credential_id, data.credential_public_key, data.counter ?? 0, data.transports ?? null)
  },

  findByUserId(userId: number): Authenticator[] {
    return db.prepare('SELECT * FROM authenticators WHERE user_id = ?').all(userId) as Authenticator[]
  },

  findByCredentialId(credentialId: string): Authenticator | undefined {
    return db.prepare('SELECT * FROM authenticators WHERE credential_id = ?').get(credentialId) as Authenticator | undefined
  },

  updateCounter(id: number, counter: number): void {
    db.prepare('UPDATE authenticators SET counter = ? WHERE id = ?').run(counter, id)
  }
}

export const todoDB = {
  findByUserId(userId: number): Todo[] {
    return db.prepare(`
      SELECT * FROM todos WHERE user_id = ?
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
        due_date ASC,
        created_at DESC
    `).all(userId) as Todo[]
  },

  findById(id: number): Todo | undefined {
    return db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as Todo | undefined
  },

  create(data: {
    user_id: number
    title: string
    due_date?: string | null
    priority?: Priority
    is_recurring?: number
    recurrence_pattern?: RecurrencePattern | null
    reminder_minutes?: number | null
  }): Todo {
    const result = db.prepare(
      'INSERT INTO todos (user_id, title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      data.user_id,
      data.title,
      data.due_date ?? null,
      data.priority ?? 'medium',
      data.is_recurring ?? 0,
      data.recurrence_pattern ?? null,
      data.reminder_minutes ?? null
    )
    return todoDB.findById(result.lastInsertRowid as number)!
  },

  update(id: number, data: Partial<Pick<Todo, 'title' | 'completed' | 'due_date' | 'priority' | 'is_recurring' | 'recurrence_pattern' | 'reminder_minutes' | 'last_notification_sent'>>): Todo | undefined {
    const fields: string[] = []
    const values: unknown[] = []

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
    if (data.completed !== undefined) { fields.push('completed = ?'); values.push(data.completed) }
    if (data.due_date !== undefined) { fields.push('due_date = ?'); values.push(data.due_date) }
    if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority) }
    if (data.is_recurring !== undefined) { fields.push('is_recurring = ?'); values.push(data.is_recurring) }
    if (data.recurrence_pattern !== undefined) { fields.push('recurrence_pattern = ?'); values.push(data.recurrence_pattern) }
    if (data.reminder_minutes !== undefined) { fields.push('reminder_minutes = ?'); values.push(data.reminder_minutes) }
    if (data.last_notification_sent !== undefined) { fields.push('last_notification_sent = ?'); values.push(data.last_notification_sent) }

    if (fields.length === 0) return todoDB.findById(id)

    values.push(id)
    db.prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return todoDB.findById(id)
  },

  delete(id: number): void {
    db.prepare('DELETE FROM todos WHERE id = ?').run(id)
  },

  findDueForNotification(): Todo[] {
    return db.prepare(`
      SELECT * FROM todos
      WHERE completed = 0
        AND due_date IS NOT NULL
        AND reminder_minutes IS NOT NULL
        AND (last_notification_sent IS NULL OR last_notification_sent < datetime(due_date, '-' || reminder_minutes || ' minutes', '+1 minute'))
        AND datetime('now') >= datetime(due_date, '-' || reminder_minutes || ' minutes')
        AND datetime('now') <= datetime(due_date, '+1 hour')
    `).all() as Todo[]
  }
}

export const subtaskDB = {
  findByTodoId(todoId: number): Subtask[] {
    return db.prepare('SELECT * FROM subtasks WHERE todo_id = ? ORDER BY position, created_at').all(todoId) as Subtask[]
  },

  findById(id: number): Subtask | undefined {
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id) as Subtask | undefined
  },

  create(data: { todo_id: number; title: string; position?: number }): Subtask {
    const maxPos = (db.prepare('SELECT MAX(position) as max FROM subtasks WHERE todo_id = ?').get(data.todo_id) as { max: number | null }).max ?? -1
    const result = db.prepare(
      'INSERT INTO subtasks (todo_id, title, position) VALUES (?, ?, ?)'
    ).run(data.todo_id, data.title, data.position ?? maxPos + 1)
    return subtaskDB.findById(result.lastInsertRowid as number)!
  },

  update(id: number, data: Partial<Pick<Subtask, 'title' | 'completed'>>): Subtask | undefined {
    const fields: string[] = []
    const values: unknown[] = []

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
    if (data.completed !== undefined) { fields.push('completed = ?'); values.push(data.completed) }

    if (fields.length === 0) return subtaskDB.findById(id)

    values.push(id)
    db.prepare(`UPDATE subtasks SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return subtaskDB.findById(id)
  },

  delete(id: number): void {
    db.prepare('DELETE FROM subtasks WHERE id = ?').run(id)
  }
}

export const tagDB = {
  findByUserId(userId: number): Tag[] {
    return db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name').all(userId) as Tag[]
  },

  findById(id: number): Tag | undefined {
    return db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as Tag | undefined
  },

  findByTodoId(todoId: number): Tag[] {
    return db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `).all(todoId) as Tag[]
  },

  create(data: { user_id: number; name: string; color?: string }): Tag {
    const result = db.prepare(
      'INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)'
    ).run(data.user_id, data.name.trim(), data.color ?? '#3B82F6')
    return tagDB.findById(result.lastInsertRowid as number)!
  },

  update(id: number, data: Partial<Pick<Tag, 'name' | 'color'>>): Tag | undefined {
    const fields: string[] = []
    const values: unknown[] = []

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name.trim()) }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color) }

    if (fields.length === 0) return tagDB.findById(id)

    values.push(id)
    db.prepare(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return tagDB.findById(id)
  },

  delete(id: number): void {
    db.prepare('DELETE FROM tags WHERE id = ?').run(id)
  },

  addToTodo(todoId: number, tagId: number): void {
    db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)').run(todoId, tagId)
  },

  removeFromTodo(todoId: number, tagId: number): void {
    db.prepare('DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?').run(todoId, tagId)
  },

  setTodoTags(todoId: number, tagIds: number[]): void {
    db.prepare('DELETE FROM todo_tags WHERE todo_id = ?').run(todoId)
    for (const tagId of tagIds) {
      db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)').run(todoId, tagId)
    }
  }
}

export const templateDB = {
  findByUserId(userId: number): Template[] {
    return db.prepare('SELECT * FROM templates WHERE user_id = ? ORDER BY name').all(userId) as Template[]
  },

  findById(id: number): Template | undefined {
    return db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as Template | undefined
  },

  create(data: {
    user_id: number
    name: string
    description?: string | null
    category?: string | null
    title_template: string
    priority?: Priority
    is_recurring?: number
    recurrence_pattern?: RecurrencePattern | null
    reminder_minutes?: number | null
    subtasks_json?: string | null
  }): Template {
    const result = db.prepare(
      'INSERT INTO templates (user_id, name, description, category, title_template, priority, is_recurring, recurrence_pattern, reminder_minutes, subtasks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      data.user_id,
      data.name,
      data.description ?? null,
      data.category ?? null,
      data.title_template,
      data.priority ?? 'medium',
      data.is_recurring ?? 0,
      data.recurrence_pattern ?? null,
      data.reminder_minutes ?? null,
      data.subtasks_json ?? null
    )
    return templateDB.findById(result.lastInsertRowid as number)!
  },

  update(id: number, data: Partial<Pick<Template, 'name' | 'description' | 'category' | 'title_template' | 'priority' | 'is_recurring' | 'recurrence_pattern' | 'reminder_minutes' | 'subtasks_json'>>): Template | undefined {
    const fields: string[] = []
    const values: unknown[] = []

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category) }
    if (data.title_template !== undefined) { fields.push('title_template = ?'); values.push(data.title_template) }
    if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority) }
    if (data.is_recurring !== undefined) { fields.push('is_recurring = ?'); values.push(data.is_recurring) }
    if (data.recurrence_pattern !== undefined) { fields.push('recurrence_pattern = ?'); values.push(data.recurrence_pattern) }
    if (data.reminder_minutes !== undefined) { fields.push('reminder_minutes = ?'); values.push(data.reminder_minutes) }
    if (data.subtasks_json !== undefined) { fields.push('subtasks_json = ?'); values.push(data.subtasks_json) }

    if (fields.length === 0) return templateDB.findById(id)

    values.push(id)
    db.prepare(`UPDATE templates SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return templateDB.findById(id)
  },

  delete(id: number): void {
    db.prepare('DELETE FROM templates WHERE id = ?').run(id)
  }
}

export const holidayDB = {
  findByYear(year: number): Holiday[] {
    return db.prepare('SELECT * FROM holidays WHERE year = ? ORDER BY date').all(year) as Holiday[]
  },

  findByYearRange(startYear: number, endYear: number): Holiday[] {
    return db.prepare('SELECT * FROM holidays WHERE year >= ? AND year <= ? ORDER BY date').all(startYear, endYear) as Holiday[]
  },

  seed(holidays: { name: string; date: string; year: number }[]): void {
    const insert = db.prepare('INSERT OR IGNORE INTO holidays (name, date, year) VALUES (?, ?, ?)')
    const insertMany = db.transaction((items: { name: string; date: string; year: number }[]) => {
      for (const item of items) {
        insert.run(item.name, item.date, item.year)
      }
    })
    insertMany(holidays)
  },

  count(): number {
    return (db.prepare('SELECT COUNT(*) as count FROM holidays').get() as { count: number }).count
  }
}

export default db
