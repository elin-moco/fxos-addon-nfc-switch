(function ($$) {
  var MANIFEST_URL = '/fxos-addon-nfc-switch/manifest.webapp';

  // If injecting into an app that was already running at the time
  // the app was enabled, simply initialize it.
  if (document.documentElement) {
    initialize();
  }
  // Otherwise, we need to wait for the DOM to be ready before
  // starting initialization since add-ons are usually (always?)
  // injected *before* `document.documentElement` is defined.
  else {
    window.addEventListener('DOMContentLoaded', initialize);
  }

  function initialize() {

    // Remove existing control, for when this addon is re-run.
    var existingContainerEl = $$('quick-nfc');
    if (existingContainerEl) {
      existingContainerEl.parentNode.removeChild(existingContainerEl);
    }

    // Build the brightness control elements.
    var containerEl = document.createElement('li');
    containerEl.setAttribute('id', 'quick-nfc');
    containerEl.setAttribute('data-time-inserted', Date.now());

    // Markup stolen and munged from gaia settings
    containerEl.innerHTML = '<a aria-label="NfcSwitch" href="#" id="quick-nfc-switch" class="icon bb-button" data-icon="nfc" data-enabled="false" role="button" data-l10n-id="nfcButton" style="color: #008EAB;"></a>';

    // Inject the elements into the system app
    var quickSettings = $$('quick-settings').children[0];
    quickSettings.appendChild(containerEl);

    // Borrow some code from Gaia shared/js/settings_listener.js
    var _lock;
    function sl_getSettingsLock() {
      if (_lock && !_lock.closed) { return _lock; }
      var settings = window.navigator.mozSettings;
      return (_lock = settings.createLock());
    }

    var switchEl = $$('quick-nfc-switch');
    function sync_nfc_state(nfc_state) {
      if (nfc_state) {
        switchEl.setAttribute('data-enabled', 'true');
        switchEl.setAttribute('style', 'color: #008EAB;');
      }
      else {
        switchEl.setAttribute('data-enabled', 'false');
        switchEl.setAttribute('style', '');
      }
    }

    var setting = sl_getSettingsLock().get('nfc.enabled');
    setting.onsuccess = function() {
      sync_nfc_state(setting.result['nfc.enabled'])
    };

    switchEl.addEventListener('click', function () {
      setting = sl_getSettingsLock().get('nfc.enabled');
      setting.onsuccess = function() {
        var nfcState = setting.result['nfc.enabled'];
        if (nfcState) {
          _lock.set({
            'nfc.enabled': false
          });
          sync_nfc_state(false);
        }
        else {
          _lock.set({
            'nfc.enabled': true
          });
          sync_nfc_state(true);
        }
      };
    });

  }

  function uninitialize() {
    var existingContainerEl = $$('quick-nfc');
    existingContainerEl.parentNode.removeChild(existingContainerEl);
  }

  navigator.mozApps.mgmt.onenabledstatechange = function(event) {
    var app = event.application;
    if (app.manifestURL.indexOf(MANIFEST_URL) > 0 && !app.enabled) {
      uninitialize();
    }
  };
}(document.getElementById.bind(document)));

