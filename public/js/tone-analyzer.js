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
  $help.hide();
  changeColSize(document.getElementById("large-col"), 8, 12);

  $('html, body').animate({
      scrollTop: $("#large-col").offset().top
  }, 1000);

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
  changeColSize(document.getElementById("large-col"), 12, 8);
});

/**
 * grows and shrinks a col from curWidth to newWidth.
 * @param  {[object]} col: object for which to change width
 * @param  {[int]} curWidth: current width of the object
 * @param  {[int]} newWidth: desired width of the object
 */
function changeColSize(col, curWidth, newWidth) {
  var regexLg = new RegExp('(\\s|^)col-lg-' + curWidth.toString() + '(\\s|$)');
  col.className = col.className.replace(regexLg,("col-lg-" + newWidth.toString() + " "));
  var regexMd = new RegExp('(\\s|^)col-md-' + curWidth.toString() + '(\\s|$)');
  col.className = col.className.replace(regexMd,(" col-md-" + newWidth.toString() + " "));
}

/**
 * convert the input decimal string to a percentage string.
 * @param  {[string]} decimalString: decimal between -1 and 1
 */
function convertToPercentage(decimalString) {
  return (Math.round(10*(parseFloat(decimalString)*100))/10).toString() + "%"
}

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
  console.log(tone_rslt);
  $result.html('<ul>');
  for (var i = 0; i < tone_rslt.children.length; i++) {
    var cate = tone_rslt.children[i];
    console.log(cate);
    var catdiv = $('<div>').text(cate.name + ': ');
    for (var j = 0; j < cate.children.length; j++) {
      var trait = cate.children[j];
      var div = $('<span>')
        .text(trait.name + ' (' + convertToPercentage(trait.score.toString()) + ')')
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
    changeColSize(document.getElementById("large-col"), 12, 8);
    $synonyms.show();
    $synonymsLoading.show();
    $synonymsResults.hide();

    var _this = $(this);
    var  word = _this.html();

    $('.synonymTabs').empty();
    $('.synonymTabContent').empty();

    $.post('/synonym', { words: [word], limit: 5}, function(response) {

        // API returns list of traits, and synonyms within each
        // [{"trait":"openness","headword":"acknowledge","synonyms":[{"word":"adjudge","corr":-0.0378},{"word":"react","corr":-0.038},
        // Swap this by a list of words, with traits for each of them
        // [{"word":"adjudge", "traits": [{"trait":"openness", "corr":-0.0378....
        var data = preprocessSynonyms(word, response);

        processSynonym(word, data);
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

  // Only display top 5 synonym results
  allSyns = allSyns.slice(0,5);

  allSyns.forEach(function(ele) {
    var tabContentTempl = '<h4>Synonym: WORD_TO_REPLACE</h4>'+
      '<div role="tabpanel" class="tab-pane" id="TRAIT_ID_TO_REPLACE">TAB_CONTENT_TO_REPLACE</div>';
    var synsListTempl = '<div class="list-group">LIST_CONTENT_TO_REPLACE</div>';
    var synsListItemTempl = '<a class="list-group-item synonym-list-item" >' +
      '<span class="badge">TRAIT_WEIGHT</span>TRAIT_CONTENT</a>';
    var synsListItemContent = '';
    var synsListGroup = '';
    ele.traits.forEach(function(trait) {
      synsListItemContent += synsListItemTempl
        .replace(/TRAIT_CONTENT/g, trait.trait)
        .replace(/TRAIT_WEIGHT/g, trait.corr);
    });

    synsListGroup = synsListTempl.replace(/LIST_CONTENT_TO_REPLACE/g, synsListItemContent);

    $('.synonymsResults')
      .append(tabContentTempl
                .replace(/WORD_TO_REPLACE/g, ele.word)
                .replace(/TAB_CONTENT_TO_REPLACE/g,
              synsListGroup)
      );

  });

  $('.badge').each(function() {
    if (parseFloat($(this).html()) < 0)
      $(this).attr('class', 'badge badge-neg');
    $(this)[0].innerText = convertToPercentage($(this)[0].innerText);
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

function preprocessSynonyms(word, response) {
  var synonyms = {};
  response.forEach(function(elem) {
    if (elem.headword!=word) {
      return; // Ignore this one. Should never happen if we requested this word anyway
    }
    var trait = elem.trait;
    elem.synonyms.forEach(function(syn) {
      if (!(syn.word in synonyms)) {
        synonyms[syn.word] = { word: syn.word, max: syn.corr, min: syn.corr, traits: [ { trait: elem.trait, corr: syn.corr } ] };
      } else {
        var old = synonyms[syn.word];
        synonyms[syn.word] = {
          word: syn.word,
          min: Math.min(syn.corr, old.min),
          max: Math.max(syn.corr, old.min),
          traits: old.traits.concat({ trait: elem.trait, corr: syn.corr })
        };
      }
    });
  });
  // We want them to be sorted by 'significance', defining now as the max amplitude in correlation of different
  // traits -- those are the synonyms that stand out!
  // Convert to an array so we can sort it
  var synlist = Object.keys(synonyms).map(function(k) {
    // While we are at it, also sort the traits
    synonyms[k].traits.sort(function(a, b) { return b.corr - a.corr; });
    return synonyms[k];
  })
  // Sort it
  synlist.sort(function(a, b) { return (b.max-b.min) - (a.max-a.min); });
  // Now discard the min/max values (used only for sorting) and return the words and traits only
  return synlist.map(function(syn) { return { "word": syn.word, "traits": syn.traits }; });
}

});
