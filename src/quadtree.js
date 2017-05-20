/* quadtree.js */

class Quadtree {

  constructor(rect, maxObjects=5, maxLevel=4, level=0) {
    this.rect = rect;
    this.maxObjects = Math.max(0, maxObjects);
    this.maxLevel = Math.max(0, maxLevel);
    this.level = Math.max(0, level);
    this.nodes = [];
    this.objects = [];
  }

  insertObject(obj) {
    const index = this.findChildNodeIndex(obj);
    if (index === -1) {
      this.objects.push(obj);
      if (this.objects.length > this.maxObjects && this.level < this.maxLevel) {
        this.split();
      }
    } else {
      this.nodes[index].insertObject(obj);
    }
  }

  removeObjectById(id) {
    const objCount = this.objects.length;
    for (let i = 0; i < objCount; ++i) {
      if (this.objects[i].id === id) {
        this.objects.splice(i, 1);
        return true;
      }
    }
    const nodeCount = this.nodes.length;
    for (let i = 0; i < nodeCount; ++i) {
      if (this.nodes[i].removeObjectById(id)) {
        return true;
      }
    }
    return false;
  }

  clear() {
    this.objects.length = 0;
    const count = this.nodes.length;
    if (count > 0) {
      for (let i = 0; i < count; ++i) {
        this.nodes[i].clear();
      }
      this.nodes.length = 0;
    }
  }

  findCandidates(rect, outCandidates) {
    const objCount = this.objects.length;
    const nodeCount = this.nodes.length;
    if (objCount == 0 && nodeCount == 0
      || this.testRectIntersection(rect, this.rect) === false) {
      return;
    }
    for (let i = 0; i < objCount; ++i) {
      outCandidates.push(this.objects[i]);
    }
    for (let i = 0; i < nodeCount; ++i) {
      this.nodes[i].findCandidates(rect, outCandidates);
    }
  }

  getAllObjects() {
    let allObjects = [];
    if (this.objects.length > 0) {
      allObjects = allObjects.concat(this.objects);
    }

    const count = this.nodes.length;
    for (let i = 0; i < count; ++i) {
      allObjects = allObjects.concat(this.nodes[i].getAllObjects());
    }
    return allObjects;
  }

  rebuild() {
    const objects = this.getAllObjects();
    this.clear();
    const count = objects.length;
    for (let i = 0; i < count; ++i) {
      this.insertObject(objects[i]);
    }
  }

  findChildNodeIndex(obj) {
    const count = this.nodes.length;
    for (let i = 0; i < count; ++i) {
      if (this.isObjectInsideRect(obj, this.nodes[i].rect)) {
        return i;
      }
    }
    return -1;
  }

  split() {
    if (this.nodes.length === 0) {
      const halfWidth = this.rect.width * 0.5;
      const halfHeight = this.rect.height * 0.5;
      const quarterWidth = this.rect.width * 0.25;
      const quarterHeight = this.rect.height * 0.25;
      const nextLevel = this.level + 1;

      // |1|0|
      // |2|3|
      this.nodes.length = 0;
      this.nodes.push(new Quadtree({ x: this.rect.x + quarterWidth, y: this.rect.y + quarterHeight, width: halfWidth, height: halfHeight }, this.maxObjects, this.maxLevel, nextLevel));
      this.nodes.push(new Quadtree({ x: this.rect.x - quarterWidth, y: this.rect.y + quarterHeight, width: halfWidth, height: halfHeight }, this.maxObjects, this.maxLevel, nextLevel));
      this.nodes.push(new Quadtree({ x: this.rect.x - quarterWidth, y: this.rect.y - quarterHeight, width: halfWidth, height: halfHeight }, this.maxObjects, this.maxLevel, nextLevel));
      this.nodes.push(new Quadtree({ x: this.rect.x + quarterWidth, y: this.rect.y - quarterHeight, width: halfWidth, height: halfHeight }, this.maxObjects, this.maxLevel, nextLevel));
    }

    const count = this.objects.length;
    for (let i = 0; i < this.objects.length; ) {
      const index = this.findChildNodeIndex(this.objects[i]);
      if (index !== -1) {
        this.nodes[index].insertObject(this.objects.splice(i, 1)[0]);
      } else {
        ++i;
      }
    }
  }

  isObjectInsideRect(obj, rect) {
    const halfWidth = rect.width * 0.5;
    const objHalfWidth = obj.width * 0.5;
    if (obj.x - objHalfWidth > rect.x - halfWidth
      && obj.x + objHalfWidth < rect.x + halfWidth) {
        const halfHeight = rect.height * 0.5;
        const objHalfHeight = obj.height * 0.5;
        if (obj.y - objHalfHeight >  rect.y - halfHeight
          && obj.y + objHalfHeight < rect.y + halfHeight) {
            return true;
        }
    }
    return false;
  }

  testRectIntersection(lhs, rhs) {
    const lhsHalfWidth = lhs.width * 0.5;
    const rhsHalfWidth = rhs.width * 0.5;
    if (lhs.x + lhsHalfWidth < rhs.x - rhsHalfWidth) return false;
    if (lhs.x - lhsHalfWidth > rhs.x + rhsHalfWidth) return false;
    const lhsHalfHeight = lhs.height * 0.5;
    const rhsHalfHeight = rhs.height * 0.5;
    if (lhs.y + lhsHalfHeight < rhs.y - rhsHalfHeight) return false;
    if (lhs.y - lhsHalfHeight > rhs.y + rhsHalfHeight) return false;
    return true;
  }

  dump() {
    console.log('dump, level=' + this.level + ', nodes=' + this.nodes.length);
    console.log('objects:');
    for (let i = 0; i < this.objects.length; ++i) {
      console.log(i, this.objects[i]);
    }
    if (this.nodes.length > 0) {
      console.log('nodes:');
      for (let i = 0; i < this.nodes.length; ++i) {
        this.nodes[i].dump();
      }
    }
  }

  drawBounds(context, color, canvasOriginOffset, canvasHeight) {
    // Convert cartesian coordinates to canvas coordinates:
    const x = this.rect.x + canvasOriginOffset.x;
    const y = canvasHeight - (this.rect.y + canvasOriginOffset.y);
    const halfWidth = this.rect.width * 0.5;
    const halfHeight = this.rect.height * 0.5;
    this.drawRect(context, x - halfWidth, y - halfHeight, this.rect.width, this.rect.height, color);
    for (let i = 0; i < this.nodes.length; ++i) {
      this.nodes[i].drawBounds(context, color, canvasOriginOffset, canvasHeight);
    }
  }

  drawObjects(context, color, canvasOriginOffset, canvasHeight) {
    const objCount = this.objects.length;
    for (let i = 0; i < objCount; ++i) {
      const obj = this.objects[i];
      const x = obj.x + canvasOriginOffset.x;
      const y = canvasHeight - (obj.y + canvasOriginOffset.y);
      const halfWidth = obj.width * 0.5;
      const halfHeight = obj.height * 0.5;
      this.drawRect(context, x - halfWidth, y - halfHeight, obj.width, obj.height, color);
    }
    const nodeCount = this.nodes.length;
    for (let i = 0; i < nodeCount; ++i) {
      this.nodes[i].drawObjects(context, color, canvasOriginOffset, canvasHeight);
    }
  }

  drawRect(context, x, y, width, height, color) {
    context.strokeStyle = color;
    context.strokeRect(x, y, width, height);
  }
}
