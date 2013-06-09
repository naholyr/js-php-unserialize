// Wrapper for nodejs/browser compat
(function (window, exports) {

// Public API
exports.unserialize = unserialize;
exports.unserializeSession = unserializeSession;

/**
 * Unserialize data taken from PHP's serialize() output
 *
 * Taken from https://github.com/kvz/phpjs/blob/master/functions/var/unserialize.js
 * Fixed window reference to make it nodejs-compatible
 *
 * @param string serialized data
 * @return unserialized data
 * @throws
 */
function unserialize (data) {
  // http://kevin.vanzonneveld.net
  // +     original by: Arpad Ray (mailto:arpad@php.net)
  // +     improved by: Pedro Tainha (http://www.pedrotainha.com)
  // +     bugfixed by: dptr1988
  // +      revised by: d3x
  // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +        input by: Brett Zamir (http://brett-zamir.me)
  // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     improved by: Chris
  // +     improved by: James
  // +        input by: Martin (http://www.erlenwiese.de/)
  // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     improved by: Le Torbi
  // +     input by: kilops
  // +     bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Jaroslaw Czarniak
  // %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
  // %            note: Aiming for PHP-compatibility, we have to translate objects to arrays
  // *       example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
  // *       returns 1: ['Kevin', 'van', 'Zonneveld']
  // *       example 2: unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
  // *       returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}
  var that = this,
    utf8Overhead = function (chr) {
      // http://phpjs.org/functions/unserialize:571#comment_95906
      var code = chr.charCodeAt(0);
      if (code < 0x0080) {
        return 0;
      }
      if (code < 0x0800) {
        return 1;
      }
      return 2;
    },
    error = function (type, msg, filename, line) {
      throw new window[type](msg, filename, line);
    },
    read_until = function (data, offset, stopchr) {
      var i = 2, buf = [], chr = data.slice(offset, offset + 1);

      while (chr != stopchr) {
        if ((i + offset) > data.length) {
          error('Error', 'Invalid');
        }
        buf.push(chr);
        chr = data.slice(offset + (i - 1), offset + i);
        i += 1;
      }
      return [buf.length, buf.join('')];
    },
    read_chrs = function (data, offset, length) {
      var i, chr, buf;

      buf = [];
      for (i = 0; i < length; i++) {
        chr = data.slice(offset + (i - 1), offset + i);
        buf.push(chr);
        length -= utf8Overhead(chr);
      }
      return [buf.length, buf.join('')];
    },
    _unserialize = function (data, offset) {
      var dtype, dataoffset, keyandchrs, keys,
        readdata, readData, ccount, stringlength,
        i, key, kprops, kchrs, vprops, vchrs, value,
        chrs = 0,
        typeconvert = function (x) {
          return x;
        };

      if (!offset) {
        offset = 0;
      }
      dtype = (data.slice(offset, offset + 1)).toLowerCase();

      dataoffset = offset + 2;

      switch (dtype) {
        case 'i':
          typeconvert = function (x) {
            return parseInt(x, 10);
          };
          readData = read_until(data, dataoffset, ';');
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 1;
          break;
        case 'b':
          typeconvert = function (x) {
            return parseInt(x, 10) !== 0;
          };
          readData = read_until(data, dataoffset, ';');
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 1;
          break;
        case 'd':
          typeconvert = function (x) {
            return parseFloat(x);
          };
          readData = read_until(data, dataoffset, ';');
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 1;
          break;
        case 'c':
          var res = getClass(data, dataoffset);
          dataoffset = res[0];
          readdata = res[1];
          break;
        case 'o':
          var res = getObject(data, dataoffset);
          dataoffset = res[0];
          readdata = res[1];
          break;
        case 'n':
          readdata = null;
          break;
        case 's':
          var res = getString(data, dataoffset);
          dataoffset = res[0];
          readdata = res[1];
          break;
        case 'a':
          var res = getArray(data, dataoffset);
          dataoffset = res[0];
          readdata = res[1];
          break;
        default:
          error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype + ' :: ' + offset + JSON.stringify([dtype, data[offset], data.slice(offset-20, offset + 10), data]));
          break;
      }
      return [dtype, dataoffset - offset, typeconvert(readdata)];
    }
  ;

function getArray(data, offset) {
  var readdata
    , chrs
    , keys
    , dataoffset = offset
    , kprops
    , kchrs
    , key
    , vprops
    , vchrs
    , keyandchrs
    , i
    , value;
  readdata = {};

  keyandchrs = read_until(data, dataoffset, ':');
  chrs = keyandchrs[0];
  keys = keyandchrs[1];
  dataoffset += chrs + 2;

  for (i = 0; i < parseInt(keys, 10); i++) {
    kprops = _unserialize(data, dataoffset);
    kchrs = kprops[1];
    key = kprops[2];
    dataoffset += kchrs;

    vprops = _unserialize(data, dataoffset);
    vchrs = vprops[1];
    value = vprops[2];
    dataoffset += vchrs;

    readdata[key] = value;
  }

  dataoffset += 1;
  return [dataoffset, readdata];
}

function getCount(data, offset) {
  var ccount
    , count
    , chrs
    , stringlength
    , readData
    , readdata;
  ccount = read_until(data, offset, ':');
  chrs = ccount[0];
  count = ccount[1];
  offset += chrs + 2;
  return [offset, count];
};

function getObject(data, offset) {
  var res = getString(data, offset)
    , body
    , classname = res[1];

  offset = res[0];
  res = getArray(data, offset);
  offset = res[0];
  return [offset, {name: classname, body: res[1]}];
};
  

function getClass(data, offset) {
  var res = getString(data, offset)
    , body
    , classname = res[1];

  offset = res[0];
  res = getCount(data, offset);
  offset = res[0];
  body = data.slice(offset - 1, offset + parseInt(res[1]) );
  if (body[0] !== '{' || body[body.length - 1] !== '}') {
    throw new Error('invalid body defn: ' + JSON.stringify([body, offset, res[1], data.slice(offset-1, offset+10)]));
  }
  body = body.slice(1, -1);
  try {
    body = _unserialize(body, 0)[2];
  } catch (e) {
  }
  return [offset + parseInt(res[1]) + 1, {name: classname, body: body}];
};

function getString(data, offset) {
  var ccount
    , chrs
    , stringlength
    , readData
    , readdata;
  ccount = read_until(data, offset, ':');
  chrs = ccount[0];
  stringlength = ccount[1];
  offset += chrs + 2;

  readData = read_chrs(data, offset + 1, parseInt(stringlength, 10));
  chrs = readData[0];
  readdata = readData[1];
  offset += chrs + 2;
  if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
    error('SyntaxError', 'String length mismatch');
  }
  return [offset, readdata];
};

  return _unserialize((data + ''), 0)[2];
}
/**
 * Parse PHP-serialized session data
 *
 * @param string serialized session
 * @return unserialized data
 * @throws
 */
function unserializeSession (input) {
  return input.split(/\|/).reduce(function (output, part, index, parts) {
    // First part = $key
    if (index === 0) {
      output._currKey = part;
    }
    // Last part = $someSerializedStuff
    else if (index === parts.length - 1) {
      output[output._currKey] = unserialize(part);
      delete output._currKey;
    }
    // Other output = $someSerializedStuff$key
    else {
      var match = part.match(/^((?:.*?[;\}])+)([^;\}]+?)$/);
      if (match) {
        output[output._currKey] = unserialize(match[1]);
        output._currKey = match[2];
      } else {
        throw new Error('Parse error on part "' + part + '"');
      }
    }
    return output;
  }, {});
}

// /Wrapper
})((typeof window === 'undefined') ? global : window, (typeof window === 'undefined') ? exports : (window.PHPUnserialize = {}));
