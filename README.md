# Quadtree-js

This is yet another Quadtree implementation in JavaScript.

Quadtrees are tree data structures which can i.e. help to reduce the number of pair-wise comparisons in a (2d) scene in order find potential collision candidates. Quadtrees can also be used for image processing, mesh generation, spatial indexing etc.

## How to use

Creating a new Quadtree works as follows.
<pre>
let quadtree = new Quadtree({
    x: 0,
    y: 0,
    width: 512,
    height: 512
  },
  maxObjects,  // optional (default: 10); max. number of objects that can be stored in a node before it will be subdivided
  maxLevel);   // optional (default: 4); max. number of subdivisions per node
</pre>


Inserting an object into the Quadtree.
<pre>
quadtree.insertObject({
	x: 233,
	y: 144,
	width: 89,
	height: 55
});
</pre>

Retrieving potential candidates from the Quadtree.
<pre>
let candidates = [];
let rect = { x:0, y:0, width:64, height:64 };
quadtree.findCandidates(rect, candidates);
</pre>

Clearing the Quadtree.
<pre>
quadtree.clear();
</pre>

There are two ways to update the Quadtree.

First, clear the Quadtree and then re-insert all objects.
<pre>
quadtree.clear();
for (let i = 0; i < objects.length; ++i) {
  quadtree.insertObject(objects[i]);
}
</pre>

Second, you can simply update the Quadtree by calling the method rebuild(). This method will collect all objects from all nodes in the tree first by calling getAllObjects() and the re-insert these objects. This is obviously not the fastest way to do this but it still may be fast enough depending on your needs.
<pre>
quadtree.rebuild();
</pre>

Happy coding!

## External links:
[Wikipedia: Quadtree](https://en.wikipedia.org/wiki/Quadtree)
[Wikipedia: Collision detection](https://en.wikipedia.org/wiki/Collision_detection)
