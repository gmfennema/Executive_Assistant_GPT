function getPeople() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var people = data.map(function (row) {
    return row[0];
  });
  return ContentService.createTextOutput(JSON.stringify(people)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getPerson(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === name) {
      var personData = JSON.parse(data[i][1]);
      return ContentService.createTextOutput(
        JSON.stringify(personData)
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput("Person not found").setMimeType(
    ContentService.MimeType.TEXT
  );
}

function updateExistingValue(personData, path, newValue) {
  var pathParts = path.split(".");
  var current = personData;

  for (var i = 0; i < pathParts.length - 1; i++) {
    var part = pathParts[i];
    var arrayMatch = part.match(/(\w+)\[(\d+)\]/);

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
      part = index;
    } else {
      if (!current[part]) {
        throw new Error("Path not found");
      }
      current = current[part];
    }
  }

  var lastPart = pathParts[pathParts.length - 1];
  var lastArrayMatch = lastPart.match(/(\w+)\[(\d+)\]/);

  if (lastArrayMatch) {
    var key = lastArrayMatch[1];
    var index = parseInt(lastArrayMatch[2]);
    if (
      !current[key] ||
      !Array.isArray(current[key]) ||
      index >= current[key].length
    ) {
      throw new Error("Path not found, not an array, or index out of bounds");
    }
    current[key][index] = newValue;
  } else {
    current[lastPart] = newValue;
  }

  return personData;
}

function updateProfile(name, value, path, updateType) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var rowIndex = data.findIndex((row) => row[0] === name);

  if (rowIndex === -1) {
    return ContentService.createTextOutput("Profile not found").setMimeType(
      ContentService.MimeType.TEXT
    );
  }

  var personData = JSON.parse(data[rowIndex][1]);
  try {
    var parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
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
    return ContentService.createTextOutput(
      "Error: " + error.message
    ).setMimeType(ContentService.MimeType.TEXT);
  }

  var template = JSON.parse(sheet.getRange("B1").getValue());

  syncObjects(template, personData);

  sheet.getRange(rowIndex + 1, 2).setValue(JSON.stringify(personData));
  return ContentService.createTextOutput("Profile updated").setMimeType(
    ContentService.MimeType.TEXT
  );
}

function createProfile(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var template = sheet.getRange("B1").getValue();
  sheet.appendRow([name, template]);
  return ContentService.createTextOutput("Person added").setMimeType(
    ContentService.MimeType.TEXT
  );
}

function getNestedJsonValue(cell, key) {
  var jsonData = JSON.parse(cell);
  return searchKey(jsonData, key);
}

function searchKey(obj, keyToFind) {
  if (typeof obj !== "object" || obj === null) {
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
        if (!current[part]) {
          current[part] = [];
        }
        if (!Array.isArray(current[part])) {
          throw new Error("Target is not an array");
        }
        try {
          var jsonValue = JSON.parse(stringValue);
          current[part].push(jsonValue);
        } catch (e) {
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

function syncObjects(newObj, oldObj) {
  for (var key in newObj) {
    if (typeof newObj[key] === "object" && newObj[key] !== null) {
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
