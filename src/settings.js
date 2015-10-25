var CURRENT_BROWSER = 'chrome';

// Define the FluffblockerSettings class
// Each setting is an instance of this class
function FluffblockerSetting(label, type, defaultData) {
    this.label = label;
    this.type = 'text';
    this.defaultData = defaultData;
    this.value = '';
}

// Define settings and their defaults
var FluffblockerSettings = {};
FluffblockerSettings['news_source'] = new FluffblockerSetting('News source', 'text', 'nyt');
FluffblockerSettings['custom_feed'] = new FluffblockerSetting('Custom feed', 'text', '');

// Set the default settings
function setDefaultSetting(setting, defaultValue) {
    if (CURRENT_BROWSER == 'chrome') {
        chrome.storage.sync.get(setting, function(results) {
            if (!results[setting]) {
                // If the setting has not yet been defined, define it now
                var dataToSave = {};
                dataToSave[setting] = defaultValue;
                chrome.storage.sync.set(dataToSave, function() {
                    debugMsg('set `' + setting + '` to ' + defaultValue);
                });
            }
        });
    } else if (CURRENT_BROWSER == 'firefox') {
        getSetting(setting, function() { /* do nothing */ });
    }
}
function setAllDefaultSettings() {
    for (var setting in FluffblockerSettings) {
        if (FluffblockerSettings.hasOwnProperty(setting)) {
            var s = FluffblockerSettings[setting];
            if (s.type == 'text') {
                setDefaultSetting(setting, s.defaultData);
            }
        }
    }
}
$(document).ready(function() {
    setAllDefaultSettings();
});


// Firefox: listen for changes in settings
if (CURRENT_BROWSER == 'firefox') {
    self.port.on('settingRetrieved', function(results) {
        if (results['settingValue'] == 'not defined') {
            // Setting not yet defined; set it to its default value
            FluffblockerSettings[results['settingName']].value = FluffblockerSettings[results['settingName']].defaultData;
            setSetting(results['settingName'], FluffblockerSettings[results['settingName']].defaultData);
        } else {
            // Setting has already been defined; grab and record its value
            FluffblockerSettings[results['settingName']].value = results['settingValue'];
        }
    });
}

// Set a setting
function setSetting(setting, value) {
    var dataToSave = {};
    dataToSave[setting] = value;
    if (CURRENT_BROWSER == 'chrome') {
        chrome.storage.sync.set(dataToSave, function() {
            debugMsg('setSetting() callback: ok--set `' + setting + '` to ' + value);
        });
    } else if (CURRENT_BROWSER == 'firefox') {
        FluffblockerSettings[setting].value = value;
        self.port.emit(
            'setSetting',
                {
                    'settingName': setting,
                    'settingValue': value
                }
        );
    }
}

// Get a setting
var recursions = 0;
function getSetting(setting, callback) {
    var value = '';
    if (CURRENT_BROWSER == 'chrome') {
        var retrieval = chrome.storage.sync.get(setting, function(results) {
            value = results[setting];
            debugMsg('getSetting() callback: ok--value: ' + value);
            callback(value);
        });
    } else if (CURRENT_BROWSER == 'firefox') {
        self.port.emit('getSetting', setting);
        if (FluffblockerSettings[setting].value == '' && recursions < 50) {
            // Keep calling this function until the listener receives and 
            // stores the value of this setting
            recursions++;
            setTimeout(function() { getSetting(setting, callback); }, 10);
        } else {
            callback(FluffblockerSettings[setting].value);
        }
    }
}

// Log all settings to console (used for debugging purposes)
function logSettings() {
    if (CURRENT_BROWSER == 'chrome') {
        chrome.storage.sync.get(null, function(items) {
            debugMsg('***all settings:');
            for (var setting in items) {
                debugMsg('`' + setting + '`: ' + items[setting]);
            }
            debugMsg('done***');
        });
    } else {
        debugMsg('***all settings: ' + JSON.stringify(FluffblockerSettings));
    }
}


