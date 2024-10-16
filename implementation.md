* Invalidation: For now not to be implemented. Tools just call redraw and… everything is redrawn

* Event path: Has a lot of repetition so far, maybe it is better to convert it to a mousepath that is then branched off again in view or even tool? This would mean having a switch-case, I guess.
* The event conversion needs to know: 
  * Offset local coordinates vs. global ones (known by app)
  * Transforms (known by view). 
  * → Pass transforms to view?
* create an event adapter?