/**
 * JSON File-based Database (replaces MongoDB/Mongoose)
 * Zero external database setup required — data is stored in db.json
 * Provides a Mongoose-compatible API so routes work without changes
 */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const crypto = require('crypto');

const adapter = new FileSync(path.join(__dirname, '..', 'db.json'));
const db = low(adapter);

// Initialize defaults
db.defaults({ users: [], grievances: [] }).write();

// Generate a MongoDB-like ObjectId
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

/**
 * Creates a Mongoose-like Model backed by lowdb JSON file
 */
function createModel(collectionName) {
  const collection = () => db.get(collectionName);

  class Model {
    constructor(data) {
      Object.assign(this, data);
      if (!this._id) this._id = generateId();
      const now = new Date().toISOString();
      if (!this.createdAt) this.createdAt = now;
      this.updatedAt = now;
    }

    async save() {
      const existing = collection().find({ _id: this._id }).value();
      if (existing) {
        // Update
        this.updatedAt = new Date().toISOString();
        collection().find({ _id: this._id }).assign(this).write();
      } else {
        // Insert
        collection().push({ ...this }).write();
      }
      return this;
    }

    toJSON() {
      const obj = { ...this };
      return obj;
    }

    // Static methods (Mongoose-compatible)
    static async findOne(query) {
      const result = collection().find(query).value();
      return result ? new Model(result) : null;
    }

    static find(query = {}) {
      let results;
      if (Object.keys(query).length === 0) {
        results = collection().value();
      } else if (query.$or) {
        // Support $or with regex
        results = collection().filter(doc => {
          return query.$or.some(condition => {
            return Object.entries(condition).some(([key, val]) => {
              if (val instanceof RegExp) {
                return val.test(doc[key] || '');
              }
              return doc[key] === val;
            });
          });
        }).value();
      } else {
        results = collection().filter(query).value();
      }

      // Return a chainable query object
      let chain = results.map(r => new Model(r));

      const queryObj = {
        _results: chain,
        sort(sortObj) {
          const [field, order] = Object.entries(sortObj)[0];
          this._results.sort((a, b) => {
            if (order === -1) return a[field] < b[field] ? 1 : -1;
            return a[field] > b[field] ? 1 : -1;
          });
          return this;
        },
        skip(n) {
          this._results = this._results.slice(n);
          return this;
        },
        limit(n) {
          this._results = this._results.slice(0, n);
          return this;
        },
        then(resolve, reject) {
          try {
            resolve(this._results);
          } catch (e) {
            if (reject) reject(e);
          }
        }
      };

      return queryObj;
    }

    static async findById(id) {
      const result = collection().find({ _id: id }).value();
      return result ? new Model(result) : null;
    }

    static async findByIdAndUpdate(id, updates, options = {}) {
      const existing = collection().find({ _id: id }).value();
      if (!existing) return null;

      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      collection().find({ _id: id }).assign(updated).write();

      return options.new ? new Model(updated) : new Model(existing);
    }

    static async findByIdAndDelete(id) {
      const existing = collection().find({ _id: id }).value();
      if (!existing) return null;
      collection().remove({ _id: id }).write();
      return new Model(existing);
    }
  }

  return Model;
}

module.exports = { createModel, db };
