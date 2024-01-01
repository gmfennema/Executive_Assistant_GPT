var securityKey = '[YOUR SECURITY KEY]';

function doGet(e) {
  var operation = e.parameter.operation;
  var name = e.parameter.name;
  var data = e.parameter.data;
  var providedKey = e.parameter.securityKey; // Get the security key from the request

  // Check if the provided security key matches the expected security key
  if (providedKey !== securityKey) {
    return ContentService.createTextOutput('Invalid security key').setMimeType(ContentService.MimeType.TEXT);
  }

  switch (operation) {
    case 'getPeople':
      return getPeople();
    case 'getPerson':
      return getPerson(name);
    default:
      return ContentService.createTextOutput('Invalid operation').setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  var operation = e.parameter.operation;
  var name = e.parameter.name;
  var requestBody = JSON.parse(e.postData.contents);
  var providedKey = e.parameter.securityKey; // Get the security key from the request

  // Check if the provided security key matches the expected security key
  if (providedKey !== securityKey) {
    return ContentService.createTextOutput('Invalid security key').setMimeType(ContentService.MimeType.TEXT);
  }

  switch (operation) {
    case 'createProfile':
      return createProfile(name);
    case 'updateProfile':
      var value = requestBody.value
      var path = requestBody.path
      var updateType = requestBody.updateType
      return updateProfile(name, value, path, updateType);
    default:
      return ContentService.createTextOutput('Invalid operation').setMimeType(ContentService.MimeType.TEXT);
  }
}


function getPeople() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var people = data.map(function(row) { return row[0]; }); // Assuming names are in the first column
  return ContentService.createTextOutput(JSON.stringify(people)).setMimeType(ContentService.MimeType.JSON);
}

function getPerson(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === name) { // Assuming names are in the first column
      var personData = JSON.parse(data[i][1]); // Assuming JSON data is in the second column
      return ContentService.createTextOutput(JSON.stringify(personData)).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput('Person not found').setMimeType(ContentService.MimeType.TEXT);
}


function updateExistingValue(personData, path, newValue) {
  var pathParts = path.split(".");
  var current = personData;

  for (var i = 0; i < pathParts.length - 1; i++) {
    var part = pathParts[i];
    var arrayMatch = part.match(/(\w+)\[(\d+)\]/); // Match array elements

    if (arrayMatch) {
      var key = arrayMatch[1];
      var index = parseInt(arrayMatch[2]);
      if (!current[key] || !Array.isArray(current[key])) {
        throw new Error("Path not found or not an array");
      }
      if (index >= current[key].length) {
        throw new Error("Array index out of bounds");
      }
      current = current[key];
      part = index; // Set part to the array index
    } else {
      if (!current[part]) {
        throw new Error("Path not found");
      }
      current = current[part];
    }
  }

  var lastPart = pathParts[pathParts.length - 1];
  var lastArrayMatch = lastPart.match(/(\w+)\[(\d+)\]/); // Check if the last part is also an array element

  if (lastArrayMatch) {
    var key = lastArrayMatch[1];
    var index = parseInt(lastArrayMatch[2]);
    if (!current[key] || !Array.isArray(current[key]) || index >= current[key].length) {
      throw new Error("Path not found, not an array, or index out of bounds");
    }
    current[key][index] = newValue;
  } else {
    current[lastPart] = newValue;
  }

  return personData;
}



function addStringToArray(personData, path, stringValue) {
  var pathParts = path.split(".");
  var current = personData;

  for (var i = 0; i < pathParts.length; i++) {
    var part = pathParts[i];
    var arrayMatch = part.match(/(\w+)\[(\d+)\]/);

    if (arrayMatch) {
      var key = arrayMatch[1];
      var index = parseInt(arrayMatch[2]);
      if (!current[key] || !current[key][index]) {
        throw new Error("Path not found");
      }
      current = current[key][index];
    } else {
      if (i === pathParts.length - 1) {
        // This is the last part of the path, where the array should be
        if (!current[part]) {
          current[part] = []; // Initialize as an empty array if it doesn't exist
        }
        if (!Array.isArray(current[part])) {
          throw new Error("Target is not an array");
        }
        // Parse the string as JSON and append to the array
        try {
          var jsonValue = JSON.parse(stringValue);
          current[part].push(jsonValue);
        } catch (e) {
          // If parsing fails, append as a plain string
          current[part].push(stringValue);
        }
        break;
      }
      if (!current[part]) {
        throw new Error("Path not found");
      }
      current = current[part];
    }
  }

  return personData;
}



function updateProfile(name, value, path, updateType) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var rowIndex = data.findIndex(row => row[0] === name);

  if (rowIndex === -1) {
    return ContentService.createTextOutput('Profile not found').setMimeType(ContentService.MimeType.TEXT);
  }

  var personData = JSON.parse(data[rowIndex][1]);
  try {
    var parsedValue;
    try {
        // Attempt to parse the value as JSON
        parsedValue = JSON.parse(value);
      } catch (e) {
        // If it fails, treat it as a plain string
        parsedValue = value;
      }
    if (updateType === "overwrite") {

      personData = updateExistingValue(personData, path, parsedValue);
    } else if (updateType === "append") {
      personData = addStringToArray(personData, path, value);
    } else {
      throw new Error("Invalid update type");
    }
  } catch (error) {
    // Handle errors
    return ContentService.createTextOutput('Error: ' + error.message).setMimeType(ContentService.MimeType.TEXT);
  }

  var template = JSON.parse(sheet.getRange("B1").getValue());

  syncObjects(template, personData)

  sheet.getRange(rowIndex + 1, 2).setValue(JSON.stringify(personData));
  return ContentService.createTextOutput('Profile updated').setMimeType(ContentService.MimeType.TEXT);
}



function createProfile(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var template = sheet.getRange("B1").getValue();
  sheet.appendRow([name, template]);
  return ContentService.createTextOutput('Person added').setMimeType(ContentService.MimeType.TEXT);
}


function getNestedJsonValue(cell, key) {
  var jsonData = JSON.parse(cell);
  return searchKey(jsonData, key);
}

function searchKey(obj, keyToFind) {
  if (typeof obj !== 'object' || obj === null) {
    return null;
  }

  if (obj.hasOwnProperty(keyToFind)) {
    return obj[keyToFind];
  }

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var found = searchKey(obj[key], keyToFind);
      if (found) {
        return found;
      }
    }
  }

  return null;
}


/**
 * Synchronize two JSON objects by adding missing keys and keeping only the first element of arrays.
 *
 * This function takes two JSON objects, `newObj` and `oldObj`, and synchronizes them by:
 * 1. Adding missing keys from `newObj` to `oldObj` with empty string values.
 * 2. For arrays in `newObj`, it keeps only the first element and adds it to `oldObj`.
 * 3. Recursively syncs nested objects.
 *
 * @param {Object} newObj - The JSON object containing new data.
 * @param {Object} oldObj - The JSON object to be updated with missing keys.
 * @returns {Object} The synchronized `oldObj` with missing keys and updated arrays.
 */
function syncObjects(newObj, oldObj) {
  for (var key in newObj) {
    if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      if (Array.isArray(newObj[key])) {
        // If it's an array, create an empty array in oldObj
        oldObj[key] = oldObj[key] || [];
        
        // Ensure the length of the old array matches the length of the new array
        while (oldObj[key].length < newObj[key].length) {
          oldObj[key].push({});
        }
        
        // Recursively sync the arrays
        for (var i = 0; i < newObj[key].length; i++) {
          oldObj[key][i] = syncObjects(newObj[key][i], oldObj[key][i]);
        }
      } else {
        // If it's an object, recursively sync it
        oldObj[key] = syncObjects(newObj[key], oldObj[key] || {});
      }
    } else if (!(key in oldObj)) {
      // Otherwise, add missing keys with empty strings
      oldObj[key] = "";
    }
  }
  return oldObj;
}


