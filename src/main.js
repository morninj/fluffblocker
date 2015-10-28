// Set debug = true to allow console logging
var debug = false;
function debugMsg(msg) { if (debug) { console.log('[Fluffblocker] ' + msg); } }

var source_selection = '<form id="news-source-form"><select name="news-source" id="news-source" style="margin-left: 21px; margin-bottom: 20px;"><option value="caption">Change news source...</option><option value="bbc">BBC</option><option value="guardian">Guardian</option><option value="npr">NPR</option><option value="nyt">New York Times</option><option value="onion">Onion</option><option value="wapo">Washington Post</option><option value="custom">Custom...</option></select></form>';

// Hide FB trending topics while we wait for headlines to load
var headlineRecursions = 0;
var maxHeadlineRecursions = 300;
function hideHeadlines() {
    $('._5myl').hide();
    debugMsg('hiding headlines');
    if ($('.loading-headlines').length) { $('.loading-headlines').remove(); }
    $('<p class="loading-headlines" style="text-align: center; padding: 30px; color: #aaa;">Fluffblocker is loading<br>news headlines...</p>').insertBefore('._5myl');
    if (!$('#news-source-form').length) { $('<div class="loading-headlines-options" style="text-align: center; margin-left: -21px;">' + source_selection + '</div>').insertAfter('._5myl'); }
    if (!$('.fluffblocker').length && headlineRecursions < maxHeadlineRecursions) {
        debugMsg('**hiding headlines');
        headlineRecursions++;
        setTimeout(function() { hideHeadlines(); }, 100);
    } else {
        debugMsg('**showing headlines');
        if ($('.loading-headlines').length) { $('.loading-headlines').remove(); }
        $('.loading-headlines-options').hide();
        $('._5myl').show();
    }
}
hideHeadlines();

$(document).ready(function() {
    // Only run if we're on Facebook
    var host = window.location.host;
    if (host.match(/facebook/)) {
        // Get headlines
        getSetting('news_source', function(news_source) {
            getSetting('custom_feed', function(custom_feed) {
                // Set feed URL and news source name
                var feedUrl = '';
                var news_source_name = '';
                if (news_source == 'nyt') {
                    feedUrl = 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
                    news_source_name = 'New York Times';
                } else if (news_source == 'bbc') {
                    feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml?edition=us';
                    news_source_name = 'BBC';
                } else if (news_source == 'guardian') {
                    feedUrl = 'http://www.theguardian.com/us-news/rss';
                    news_source_name = 'Guardian';
                } else if (news_source == 'npr') {
                    feedUrl = 'http://www.npr.org/rss/rss.php?id=1001';
                    news_source_name = 'NPR';
                } else if (news_source == 'onion') {
                    feedUrl = 'http://www.theonion.com/feeds/rss';
                    news_source_name = 'Onion';
                } else if (news_source == 'wapo') {
                    feedUrl = 'http://feeds.washingtonpost.com/rss/national';
                    news_source_name = 'Washington Post';
                } else if (news_source == 'custom') {
                    feedUrl = custom_feed;
                    news_source_name = 'Custom'; // TODO grab from feed?
                } else {
                    feedUrl = 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
                    news_source_name = 'New York Times';
                }
                // Grab the RSS feed
                var ajaxUrl = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=1000&q=' + encodeURIComponent(feedUrl);
                var numHeadlinesToDisplay = 10;
                debugMsg(ajaxUrl);
                $.ajax({
                    type: 'GET',
                    url: ajaxUrl,
                    dataType: 'json',
                    error: function(e) {
                        debugMsg('Fluffblocker cannot load feed.');
                    },
                    success: function(xml) {
                        values = xml.responseData.feed.entries;
                        debugMsg('raw xml: ' + JSON.stringify(values));
                        // Compile Facebook output
                        var output = '';
                        for (i = 0; i < numHeadlinesToDisplay; i++) {
                            var title = ''; // TODO concatenate
                            var link = '';
                            var snippet = '';
                            title = values[i]['title'];
                            link = values[i]['link'];
                            snippet = values[i]['contentSnippet'];
                            output += '<li class="_5my2" data-position="' + (i + 1) + '">';
                            output += '<div class="clearfix _4_nm fluffblocker"><div class="rfloat _ohf" id="u_ps_0_6_l"><button title="Hide Trending Item" aria-label="Hide Trending Item" type="submit" value="1" class="_19_3" data-reactid=".k"><span class="_1k6k" data-topicid="108640102493378" data-reactid=".k.0"></span></button></div><div class="clearfix _uhk _42ef" style="overflow: visible !important; max-height: 200px !important;"><img class="_5r-z _8o lfloat _ohe img" alt="" src="https://static.xx.fbcdn.net/rsrc.php/v2/y4/r/-PAXP-deijE.gif"><div class="_42ef"><div class="_5r--"><span class="_5v9v"></span> <a class="_4qzh _5v0t _7ge" href="' + link + '" target="_blank"><span class="_452y"></span><span class="_5v0s _5my8">' + title + '</span></a><span class="_5v9v">: ' + snippet + '</span></div></div></div></div>';
                            output += '</li>';
                            debugMsg('output generated');
                        }
                        output = '<p style="text-align: center; color: #999; font-weight: bold; margin-top: 20px;">' + news_source_name + ' headlines</p>' + output;
                        output += '<p style="margin-left: 21px; color: #aaa; font-style: italic;">Headlines by <a style="font-weight: bold;" href="http://fluffblocker.com">Fluffblocker</a></p>';
                        output += source_selection;
                        debugMsg(output);
                        updateHeadlines(output);
                    }
                });
            });
        });
    }

    // Replace trending headlines
    var numRecursions = 0;
    var maxRecursions = 500;
    function updateHeadlines(output) {
        if ($('._5myl li').length) {
            if ($('._5myl').html().length > 500) {
                $('.loading-headlines').remove();
                $('._5myl').show();
                debugMsg($('._5myl').html());
                debugMsg('***replacing...');
                $('._5myl').html(output);
                debugMsg($('._5myl').html());
            } else {
                numRecursions++;
                if (numRecursions < maxRecursions) {
                    setTimeout(function() { updateHeadlines(); }, 50);
                }
            }
        } else {
            numRecursions++;
            if (numRecursions < maxRecursions) {
                setTimeout(function() { updateHeadlines(); }, 50);
            }
        }
    }

    // Handle news source change
    $(document).on('change', '#news-source', function() {
        if ($(this).val() != 'caption' && $(this).val() != 'custom') {
            debugMsg('news source set to ' + $(this).val());
            setSetting('news_source', $(this).val());
            window.location.reload();
        } else if ($(this).val() == 'custom') {
            var custom_feed = window.prompt('Enter a URL for an RSS feed:');    
            if (custom_feed != '') {
                setSetting('news_source', 'custom');
                setSetting('custom_feed', custom_feed);
                window.location.reload();
            }
        }
    });

});

