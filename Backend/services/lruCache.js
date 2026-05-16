class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = new Node(null, null); // Dummy head
    this.tail = new Node(null, null); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _add(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      this._remove(node);
      this._add(node);
      return node.value;
    }
    return null;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this._remove(this.cache.get(key));
    }
    const newNode = new Node(key, value);
    this._add(newNode);
    this.cache.set(key, newNode);

    if (this.cache.size > this.capacity) {
      const lruNode = this.tail.prev;
      this._remove(lruNode);
      this.cache.delete(lruNode.key);
    }
  }
  
  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
}

module.exports = new LRUCache(100);
