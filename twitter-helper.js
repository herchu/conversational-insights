/* Copyright IBM Corp. 2014
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var util  = require('util');
var  twitter = require('twitter');

var MAX_COUNT = 200;

/**
 * Create a TwitterHelper object
 * @param {Object} config configuration file that has the
 * app credentials.
 */
function TwitterHelper(configs) {
  this.count = 0;
  this.twit = [];
  var self = this;

  configs.forEach(function(config){
    self.twit.push(new twitter(config));
  });
}

TwitterHelper.prototype.getInstance = function() {
  var instance = this.count % this.twit.length;
  this.count ++;

  return this.twit[instance];
};

var toContentItem = function(tweet) {
  return {
    id: tweet.id_str,
    userid: tweet.user.id_str,
    sourceid: 'twitter',
    language: 'en',
    contenttype: 'text/plain',
    content: tweet.text.replace('[^(\\x20-\\x7F)]*',''),
    created: Date.parse(tweet.created_at)
  };
};

/**
 * @return {boolean} True if tweet is not a re-tweet or not in english
 */
var englishAndNoRetweet = function(tweet) {
  return tweet.lang === 'en' && !tweet.retweeted;
};

/**
 * Get the tweets based on the given screen_name.
 * Implemented with recursive calls that fetch up to 200 tweets in every call
 * Only returns english and original tweets (no retweets)
 */
TwitterHelper.prototype.getTweets = function(screen_name, callback) {
  console.log('getTweets for:', screen_name);

  var self = this,
    tweets = [],
    params = {
      screen_name: screen_name,
      count: MAX_COUNT,
      exclude_replies: true,
      trim_user:true};

  var processTweets = function(_tweets) {
    // Check if _tweets its an error
    if (!util.isArray(_tweets))
      return callback(_tweets,null);

    var items = _tweets
    .filter(englishAndNoRetweet)
    .map(toContentItem);

    tweets = tweets.concat(items);
    console.log(screen_name, '_tweets.count:', tweets.length);
    if (_tweets.length > 1) {
      params.max_id = _tweets[_tweets.length-1].id - 1;
      self.getInstance().getUserTimeline(params, processTweets);
    } else {
       callback(null, tweets);
    }
  };
  self.getInstance().getUserTimeline(params, processTweets);
};

/**
 * Show Twitter user information based on screen_name
 */
TwitterHelper.prototype.showUser = function(screen_name, callback) {
  this.getInstance().showUser(screen_name, function(user){
    if (user.statusCode){
      console.log(screen_name, 'is not a valid twitter');
      callback(user);
    } else
      callback(null, user);
  });
};

module.exports = TwitterHelper;