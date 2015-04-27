/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global $:false, d3:false */

'use strict';

$(function() {

  var word_to_category = d3.map();
  var category_to_word = d3.map();

  var $message = $('.message'),
    $help = $('.help'),
    $tone_rslts = $('.results-tone'),
    $loading = $('.loading-tone'),
    $result = $('.results-tone-text'),
    $composer = $('.composer'),
    $synonyms = $('.synonyms'),
    $synonymsLoading = $('.loading-synonym'),
    $synonymsResults = $('.synonymsResults');

  if (getParameterByName('after') === 'true')
    $message.val(global.sample_text.after);
  else
    $message.val(global.sample_text.before);

  if (getParameterByName('topn') !== '')
    global.top_n_weighted_positive_liwc = getParameterByName('topn');

// clear the message and result page
$('.clean-btn').click(function(){
  $message.val('');
  $tone_rslts.hide();
  $synonyms.hide();
});

$('.analysis-btn').click(function(){
  $loading.show();
  $tone_rslts.hide();

  var text = $message.val();

  // GET /tone with the text to get words matched with LIWC categories
  $.post('/tone', {
    text: text
  }, function(response) {
    doToneCheck(response, text);
  });
});

$('.back-btn').click(function(){
  $help.show();
  $loading.hide();
  $composer.show();
  $tone_rslts.hide();
  $synonyms.hide();
});

/**
 * start tone check.
 * @param  {[object]} tone_rslt: tone scores with linguistic evidence
 * @param  {[type]} text_to_analysis: the text to analyze
 */
function doToneCheck(tone_rslt, text_to_analysis) {
  console.log(text_to_analysis);
  $loading.hide();
  $composer.hide();
  $tone_rslts.show();
  //$tone_rslts.slideToggle('slow');

  text_to_analysis = text_to_analysis
    .replace(/\r\n/g, '<br />')
    .replace(/[\r\n]/g, '<br />');

  //prepare the data
  processData(tone_rslt);
  renderTraits(tone_rslt);

  //add higlight span html tags for all matched words:
  word_to_category.keys().forEach(function(wd) {
    var cates = word_to_category.get(wd);
    if (cates !== undefined)
      if (cates instanceof Array)
        text_to_analysis = addHighlightSpan(text_to_analysis, wd, cates.join(' '));
  });

  $('.output_message').html(text_to_analysis);

  //add highlight css for different categories
  category_to_word.keys().reverse().forEach(function(ele) {
    var cateName;
    if (ele.indexOf('_' + global.word_trait_corr_type.positive) > 0)
      cateName = ele.substring(0, ele.indexOf('_' + global.word_trait_corr_type.positive));
    if (ele.indexOf('_' + global.word_trait_corr_type.negative) > 0)
      cateName = ele.substring(0, ele.indexOf('_' + global.word_trait_corr_type.negative));
    $('.' + ele).css('color', global.color_schema[cateName.toLowerCase()]);
  });

  setupSynonymExpansion();
}

// Do a quick rendering of the received tones and traits on HTML
function renderTraits(tone_rslt) {
//  console.log(tone_rslt);
  $result.html('<ul>');
  for (var i = 0; i < tone_rslt.children.length; i++) {
    var cate = tone_rslt.children[i];
    console.log(cate);
    var catdiv = $('<div>').text(cate.name + ': ');
    for (var j = 0; j < cate.children.length; j++) {
      var trait = cate.children[j];
      var div = $('<span>')
        .text(trait.name + ' (' + Math.floor(trait.score * 100) / 100 + ')')
        .css('color', global.color_schema[trait.id.toLowerCase()]);
      catdiv.append(div).append(' ');
    }
    $result.append(catdiv);
  }
}


function addHighlightSpan(data, search, stylecls) {
  return data.replace(new RegExp('\\b(' + (search) + ')\\b', 'gi'),
    '<span class="matched-word ' + stylecls + '" categories="' + stylecls + '" >$1</span>');
}

function setupSynonymExpansion() {
  $('.matched-word').click(function() {
    $synonyms.show();
    $synonymsLoading.show();
    $synonymsResults.hide();

    var _this = $(this);
    var  word = _this.html();

    $('.synonymTabs').empty();
    $('.synonymTabContent').empty();

    $.post('/synonym', { words: [word], limit: 3}, function(response) {
        processSynonym(word, response);
    });
  });
}

function processSynonym(word, allSyns) {
  $synonyms.show();
  $synonymsLoading.hide();
  $synonymsResults.show();

  $synonymsResults.html('<div>Showing synonyms for term: <b>' + word +
    '</b>.<br/>Positive correlations with each trait are shown in blue, ' +
    'negative correlations are red.</div>');

  $.each(allSyns, function(_, ele) {
    var tabContentTempl = '<h4>Trait: TRAIT_ID_TO_REPLACE</h4>'+
      '<div role="tabpanel" class="tab-pane" id="TRAIT_ID_TO_REPLACE">TAB_CONTENT_TO_REPLACE</div>';
    var synsListTempl = '<div class="list-group">LIST_CONTENT_TO_REPLACE</div>';
    var synsListItemTempl = '<a class="list-group-item synonym-list-item" >' +
      '<span class="badge">SYNONYM_WEIGHT</span>SYNONYM_CONTENT</a>';
    var synsListItemContent = '';
    var synsListGroup = '';
    $.each(ele.synonyms,function(_, syn) {
      synsListItemContent += synsListItemTempl
        .replace(/SYNONYM_CONTENT/g, syn.word)
        .replace(/SYNONYM_WEIGHT/g, syn.corr);
    });

    synsListGroup = synsListTempl.replace(/LIST_CONTENT_TO_REPLACE/g, synsListItemContent);

    $('.synonymsResults')
      .append(tabContentTempl
                .replace(/TRAIT_ID_TO_REPLACE/g, ele.trait)
                .replace(/TAB_CONTENT_TO_REPLACE/g,
              synsListGroup)
      );

  });

  $('.badge').each(function() {
    if (parseFloat($(this).html()) < 0)
      $(this).attr('class', 'badge badge-neg');
  });

}

function processData(traits) {
  if (traits.children === undefined) {
    //leaf node
    traits.mixedNode = traits.linguistic_evidence.length > 1 ? true : false;

    //use the score to calculate layout
    traits.layout_weight = traits.score;

    traits.linguistic_evidence.forEach(function(el) {

      if (el.correlation === global.word_trait_corr_type.positive) {
        //extract trait-word mapping
        category_to_word.set(traits.id + '_' + global.word_trait_corr_type.positive, el.words);
        //extract word-trait mapping
        el.words.forEach(function(w) {
          var curCates = word_to_category.get(w);
          if (curCates === undefined)
            word_to_category.set(w, [traits.id + '_' + global.word_trait_corr_type.positive]);
          else
          if ($.inArray(traits.id + '_' + global.word_trait_corr_type.positive, curCates) === -1) {
            //not existing
            curCates.push(traits.id + '_' + global.word_trait_corr_type.positive);
            word_to_category.set(w, curCates);
          }
        });
      }

      if (el.correlation === global.word_trait_corr_type.negative) {
        //extract trait-word mapping
        category_to_word.set(traits.id + '_' + global.word_trait_corr_type.negative, el.words);
        //extract word-trait mapping
        el.words.forEach(function(w) {
          var curCates = word_to_category.get(w);
          if (curCates === undefined)
            word_to_category.set(w, [traits.id + '_' + global.word_trait_corr_type.negative]);
          else
          if ($.inArray(traits.id + '_' + global.word_trait_corr_type.negative, curCates) === -1) {
            //not existing
            curCates.push(traits.id + '_' + global.word_trait_corr_type.negative);
            word_to_category.set(w, curCates);
          }

        });
      }

    });

  } else {
    //recursive do the data process
    traits.children.forEach(function(child) {
      processData(child);
    });
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
  var regexS = '[\\?&]' + name + '=([^&#]*)';
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if (results === null)
    return '';
  else
    return decodeURIComponent(results[1].replace(/\+/g, ' '));
}

});
