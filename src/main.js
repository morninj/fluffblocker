// Set debug = true to allow console logging
var debug = false;
function debugMsg(msg) { if (debug) { console.log('[Fluffblocker] ' + msg); } }

// Hide FB trending topics while we wait for NYT headlines to load
var headlineRecursions = 0;
var maxHeadlineRecursions = 300;
function hideHeadlines() {
    $('._5myl').hide();
    debugMsg('hiding headlines');
    if ($('.loading-headlines').length) { $('.loading-headlines').remove(); }
    $('<p class="loading-headlines" style="text-align: center; padding: 30px; color: #aaa;">Fluffblocker is loading<br>New York Times headlines...</p>').insertBefore('._5myl');
    if (!$('.fluffblocker').length && headlineRecursions < maxHeadlineRecursions) {
        debugMsg('**hiding headlines');
        headlineRecursions++;
        setTimeout(function() { hideHeadlines(); }, 100);
    } else {
        debugMsg('**showing headlines');
        if ($('.loading-headlines').length) { $('.loading-headlines').remove(); }
        $('._5myl').show();
    }
}
hideHeadlines();

$(document).ready(function() {
    // Only run if we're on Facebook
    var host = window.location.host;
    if (host.match(/facebook/)) {
        // Get NYT headlines
        feedUrl = 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
        ajaxUrl = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=1000&q=' + encodeURIComponent(feedUrl);
        var numHeadlinesToDisplay = 10;
        debugMsg(ajaxUrl);
        $.ajax({
            type: 'GET',
            url: ajaxUrl,
            dataType: 'json',
            error: function(e) {
                debugMsg('Fluffblocker cannot load NYT feed.');
            },
            success: function(xml) {
                values = xml.responseData.feed.entries;
                debugMsg(values);
                // Compile Facebook output
                var output = '';
                for (i = 0; i < numHeadlinesToDisplay; i++) {
                    var title = values[i]['title'];
                    var link = values[i]['link'];
                    var snippet = values[i]['contentSnippet'];
                    output += '<li class="_5my2" data-position="' + (i + 1) + '">';
                    output += '<div class="clearfix _4_nm fluffblocker"><div class="rfloat _ohf" id="u_ps_0_6_l"><button title="Hide Trending Item" aria-label="Hide Trending Item" type="submit" value="1" class="_19_3" data-reactid=".k"><span class="_1k6k" data-topicid="108640102493378" data-reactid=".k.0"></span></button></div><div class="clearfix _uhk _42ef" style="overflow: visible !important; max-height: 200px !important;"><img class="_5r-z _8o lfloat _ohe img" alt="" src="https://static.xx.fbcdn.net/rsrc.php/v2/y4/r/-PAXP-deijE.gif"><div class="_42ef"><div class="_5r--"><span class="_5v9v"></span> <a class="_4qzh _5v0t _7ge" href="' + link + '" target="_blank"><span class="_452y"></span><span class="_5v0s _5my8">' + title + '</span></a><span class="_5v9v">: ' + snippet + '</span></div></div></div></div>';
                    output += '</li>';
                    debugMsg('output generated');
                }
                output += '<p style="margin-left: 21px; color: #aaa; font-style: italic;">Headlines by <a style="font-weight: bold;" href="http://fluffblocker.com">Fluffblocker</a></p>';
                debugMsg(output);
                updateHeadlines(output);
            }
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

});

