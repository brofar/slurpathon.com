let settings = {
  donateButtonText: 'Donate',
  refreshInterval: 60, //In seconds
  entityID: '56839',
  entityType: 'team',
  // No real need to edit below here
  basePath: 'https://www.extra-life.org/',
  currencySymbol: '$',
  currencyType: 'USD',
  allowTeamDonations: false,
  donateWindowWidth: 710,
  donateWindowHeight: 600,
  participantQuery: '?limit=7',
  teamQuery: '?limit=7'
}

function buildEndpoint(entityID, entityType, params) {
  var basePath = settings.basePath;

  switch (entityType) {
    case 'participant':
      return basePath + 'api/participants/' + entityID + '/donors' + settings.participantQuery;
      break;

    case 'team':
      return basePath + 'api/teams/' + entityID + '/donations' + settings.teamQuery;
      break;

    case 'participantDisplayName':
      return basePath + 'api/participants/' + entityID;
      break;

    case 'teamDisplayName':
      return basePath + 'api/teams/' + entityID;
      break;

    default:
      return basePath + 'api/participants/' + entityID + '/donations' + settings.participantQuery;
      break;
  }
}

function request(entityID, entityType, verb, done, params) {
  var xhr = new XMLHttpRequest();
  var endpoint = this.buildEndpoint(entityID, entityType, params);
  xhr.open(verb, endpoint);

  xhr.onload = function () {
    done(null, JSON.parse(xhr.response));
  };

  xhr.onerror = function () {
    done(xhr.response);
  };

  xhr.onloadend = function () {
    if (xhr.status == 404) {
      if (entityType === 'participantDisplayName') {
        done('Participant not found. Please enter a valid participant ID.');
      } else if (entityType === 'teamDisplayName') {
        done('Team not found. Please enter a valid team ID.');
      } else {
        done('404 entity not found.');
      }
    }
  };

  xhr.send();
}

function watch() {
  console.log(`[BROFAR]`, `[EXTRALIFE-WATCH]`, `Polling Extra Life`);
  var parent = this;
  request(settings.entityID, settings.entityType, 'GET', function (err, data) {
    if (err) {
      console.error(err);
    }

    parent.updateLeaderboard(data);
  });
  request(settings.entityID, "".concat(settings.entityType, "DisplayName"), 'GET', function (err, data) {
    if (err) {
      console.error(err);
    }

    parent.updateDisplayName(data);
    parent.updateDonationLink(data);
  });
  setTimeout(function () {
    parent.watch(settings.entityID, settings.entityType);
  }, settings.refreshInterval * 1000);
}

function validate(fieldType, data) {
  var regex = '';
  var errMessage = '';

  switch (fieldType) {
    case 'participantID':
      regex = '^[0-9]*$';
      errMessage = 'Please enter a valid numeric participant ID.';
      break;

    case 'teamID':
      regex = '^[0-9]*$';
      errMessage = 'Please enter a valid numeric team ID.';
      break;

    case 'text':
      regex = '([A-Z])\w+';
      errMessage = 'Please enter valid text.';
      break;
  }

  if (data.match(regex)) {
    return;
  } else {
    return errMessage;
  }
}

function formatCurrency(amount, minimumFractionDigits, maximumFractionDigits) {
  var currencySymbol = typeof settings.currencySymbol != 'undefined' ? settings.currencySymbol : '$';
  var currencyType = typeof settings.currencyType != 'undefined' ? settings.currencyType : '';
  return currencySymbol + amount.toLocaleString('en', {
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits
  }) + " <span class=\"currency\">".concat(currencyType, "</span>");
}

function updateDonationLink(data) {
  var donateButton = document.getElementById('donate-button');
  donateButton.textContent = settings.donateButtonText;
  var donateURL = settings.basePath + 'index.cfm?fuseaction=donorDrive.';
  donateURL += settings.entityType + '&' + settings.entityType + 'ID=' + settings.entityID;
  href = donateButton.getAttribute('href');
  //check the length of href.. is it less than 1 or is a space
  if(href.trim().length < 1) {
    donateButton.setAttribute('href', donateURL);
  }
  donateButton.setAttribute('target', "_blank");
}

function updateDisplayName(data) {
  if (data) {
    document.getElementById('display-name').textContent = data.displayName ? data.displayName : data.name;
    this.calcProgressBar(data.sumDonations, data.fundraisingGoal);
    document.getElementById('profile__progress-bar-raised').innerHTML = `Raised: ${this.formatCurrency(data.sumDonations, 0, 0)} <span class="raised-remaining">(${this.formatCurrency(data.fundraisingGoal - data.sumDonations, 0, 0)} Remaining)</span>`;
    document.getElementById('profile__progress-bar-goal').innerHTML = 'Goal: ' + this.formatCurrency(data.fundraisingGoal, 0, 0);
  } else {
    console.error('Error, participant displayName or team name missing.');
    return;
  }
}

function calcProgressBar(completed, target) {
  var element = document.getElementById("profile__progress-bar-progress");
  var width = Math.ceil(completed / target * 100);

  if (width >= 100) {
    element.style.width = '100%';
  } else {
    element.style.width = width + '%';
  }
}

function updateLeaderboard(data) {
  var table = document.getElementById('js-top-donors-list');
  table.textContent = '';
  var row = '';
  var donor = '';
  var amount = '';

  if (data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      row = document.createElement('li');

      donor = document.createElement('span');
      donor.classList.add('charity-leaderboard__donor-name');
      donor.innerHTML = `${data[i].displayName ? data[i].displayName : 'N/A'} (${jQuery.timeago(data[i].createdDateUTC)})`;

      amount = document.createElement('span');
      amount.classList.add('charity-leaderboard__donation-amount');
      amount.innerHTML = data[i].amount ? this.formatCurrency(data[i].amount, 2, 2) : 'N/A';

      message = document.createElement('span');
      message.classList.add('charity-leaderboard__message');
      message.innerHTML = data[i].message ? data[i].message : '';

      table.appendChild(row);
      row.appendChild(donor);
      row.appendChild(amount);
      row.appendChild(message);
    }
  } else {
    row = document.createElement('li');

    if (settings.entityType == 'team') {
      row.textContent = 'Be our first donation!';
    } else {
      row.textContent = 'Be my first donation!';
    }

    row.setAttribute("style", "text-align: center");
    table.appendChild(row);
  }
}

// Do the thing

try {
  var subHeaderPath;
  var platform = document.body.getAttribute("data-platform");

  if (typeof settings.subHeaderPath == 'undefined') {
    subHeaderPath = settings.basePath;
  } else {
    subHeaderPath = settings.subHeaderPath;
  } //build the UI elements


  document.getElementById('charity-leaderboard').style.visibility = 'visible';
  watch();
} catch (err) {
  console.error(err);
}