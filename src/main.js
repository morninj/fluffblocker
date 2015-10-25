$(document).ready(function() {

    // Only run if we're on Facebook
    var host = window.location.host;
    if (host.match(/facebook/)) {
        // Get NYT headlines
        feedUrl = 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
        ajaxUrl = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=1000&q=' + encodeURIComponent(feedUrl);
        var numHeadlinesToDisplay = 10;
        console.log(ajaxUrl);
        $.ajax({
            type: 'GET',
            url: ajaxUrl,
            dataType: 'json',
            error: function(e) {
                console.log('Fluffblocker cannot load NYT feed.');
            },
            success: function(xml) {
                values = xml.responseData.feed.entries;
                console.log(values);
                // Compile Facebook output
                var output = '';
                for (i = 0; i < numHeadlinesToDisplay; i++) {
                    var title = values[i]['title'];
                    var link = values[i]['link'];
                    var snippet = values[i]['contentSnippet'];
                    output += '<li class="_5my2" data-position="' + (i + 1) + '">';
                    output += '<div class="clearfix _4_nm"><div class="rfloat _ohf" id="u_ps_0_6_l"><button title="Hide Trending Item" aria-label="Hide Trending Item" type="submit" value="1" class="_19_3" data-reactid=".k"><span class="_1k6k" data-topicid="108640102493378" data-reactid=".k.0"></span></button></div><div class="clearfix _uhk _42ef" style="overflow: visible !important; max-height: 200px !important;"><img class="_5r-z _8o lfloat _ohe img" alt="" src="https://static.xx.fbcdn.net/rsrc.php/v2/y4/r/-PAXP-deijE.gif"><div class="_42ef"><div class="_5r--"><span class="_5v9v"></span> <a class="_4qzh _5v0t _7ge" href="' + link + '"><span class="_452y"></span><span class="_5v0s _5my8">' + title + '</span></a><span class="_5v9v">: ' + snippet + '</span></div></div></div></div>';
                    output += '</li>';
                    console.log('output generated');
                }
                console.log(output);
                updateHeadlines(output);
            }
        });
    }

    // Replace trending headlines
    var numRecursions = 0;
    var maxRecursions = 100;
    function updateHeadlines(output) {
        if ($('._5myl li').length) {
            if ($('._5myl').html().length > 500) {
                // TODO rm all console.logs
                console.log($('._5myl').html());
                console.log('**************************************replacing...');
                $('._5myl').html(output);
                console.log($('._5myl').html());
            } else {
                numRecursions++;
                if (numRecursions < maxRecursions) {
                    setTimeout(function() { updateHeadlines(); }, 250);
                }
            }
        } else {
            numRecursions++;
            if (numRecursions < maxRecursions) {
                setTimeout(function() { updateHeadlines(); }, 250);
            }
        }
    }

});

// TODO noun project icon credit
