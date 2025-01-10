// src/services/conversationStore.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConversationStore {
  constructor(storePath = path.join(__dirname, '../../conversationStore.json')) {
    this.storePath = storePath;
    this.store = {};
    this._load();
  }

  _load() {
    if (fs.existsSync(this.storePath)) {
      const data = fs.readFileSync(this.storePath, 'utf8');
      try {
        this.store = JSON.parse(data);
      } catch (err) {
        console.error('[ConversationStore] Failed to parse JSON:', err.message);
        this.store = {};
      }
    } else {
      this.store = {};
    }
  }

  _save() {
    fs.writeFileSync(this.storePath, JSON.stringify(this.store, null, 2), 'utf8');
  }

  getHistory(username) {
    if (!this.store[username]) {
      this.store[username] = [];
    }
    return this.store[username];
  }

  addMessage(username, role, content) {
    if (!this.store[username]) {
      this.store[username] = [];
    }
    this.store[username].push({ role, content });
    this._save();
  }
}

export default ConversationStore;