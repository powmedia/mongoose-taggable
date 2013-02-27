#mongoose-taggable

A simple tagging plugin for Mongoose

Adds the ability to add and remove tags to a document, and find models filtered by tags.
Uses safe atomic updates to avoid race conditions.

NOTE: Indexes are not applied to the tags path, because you should probably
use a compound index with other paths in your schema

##API

###model.addTag(tag, cb)
Add a tag to a document atomically

NOTE: This method modifies the document on the database

@param {String} tag    The tag to add
@param {Function} cb   Callback(err, addedTag)  addedTag will be false if tag already existed; true if added


###model.removeTag(tag, cb)
Remove a tag from a document atomically

NOTE: This method modifies the document on the database

@param {String} tag    The tag to remove
@param {Function} cb   Callback(err, removedTag)  removedTag will be false if tag didn't exist; true if removed


###model.hasTag(tag)
Returns whether the document as a given tag

@param {String} tag

@return {Boolean}


###Model.filterByTags(query, tags)
Alters a query to filter by tags.

@param {Query} query       Mongoose query object
@param {String[]} tags     Array of tags to filter by
