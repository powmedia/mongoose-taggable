var _ = require('underscore');


/**
 * Mongoose plugin
 * 
 * Adds the ability to add and remove tags to a document, and find models filtered by tags.
 * Uses safe atomic updates to avoid race conditions.
 * Meant to be used in a similar way to GitHub Issue's 'labels' feature.
 *
 * NOTE: Indexes are not applied to the tags path, because you should probably
 * use a compound index with other paths in your schema
 *
 * @param {Schema} schema
 * @param {Object} [pluginOptions]
 * @param {String} [pluginOptions.path]           Path/key where tags will be stored. Default: 'tags'
*/
module.exports = function(schema, pluginOptions) {
  pluginOptions = _.extend({
    path: 'tags'
  }, pluginOptions);

  //Add paths to schema
  var paths = {};
  paths[pluginOptions.path] = [String];

  schema.add(paths);


  /**
   * Add a tag to a document atomically
   * 
   * NOTE: This method modifies the document on the database
   *
   * @param {String} tag    The tag to add
   * @param {Function} cb   Callback(err, addedTag)  addedTag will be false if tag already existed; true if added
   */
  schema.methods.addTag = function(tag, cb) {
    //Find the doc  to update if it doesn't have the tag
    var conditions = {};
    conditions._id = this._id;
    conditions[pluginOptions.path] = { $ne: tag };

    //Add the tag to the model
    var update = {};
    update.$push = {};
    update.$push[pluginOptions.path] = tag;

    this.constructor.update(conditions, update, function(err, numDocsChanged) {
      if (err) return cb(err);

      cb(null, numDocsChanged ? true : false);
    });
  };


  /**
   * Remove a tag to a document atomically
   * 
   * NOTE: This method modifies the document on the database
   *
   * @param {String} tag    The tag to remove
   * @param {Function} cb   Callback(err, removedTag)  removedTag will be false if tag didn't exist; true if removed
   */
  schema.methods.removeTag = function(tag, cb) {
    //Find the doc  to update if it doesn't have the tag
    var conditions = {};
    conditions._id = this._id;
    conditions[pluginOptions.path] = tag;

    //Remove the tag from the model
    var update = {};
    update.$pull = {};
    update.$pull[pluginOptions.path] = tag;

    this.constructor.update(conditions, update, function(err, numDocsChanged) {
      if (err) return cb(err);

      cb(null, numDocsChanged ? true : false);
    });
  };


  /**
   * Returns whether the document as a given tag
   *
   * @param {String} tag
   *
   * @return {Boolean}
   */
  schema.methods.hasTag = function(tag) {
    var tags = this[pluginOptions.path];

    return _.contains(tags, tag);
  };


  /**
   * Alters a query to filter by tags.
   *
   * @param {Query} query       Mongoose query object
   * @param {String[]} tags     Array of tags to filter by
   */
  schema.statics.filterByTags = function(query, tags) {
    if (!tags || !tags.length) return query;
    
    query.where(pluginOptions.path).all(tags);

    return query;
  }
};
