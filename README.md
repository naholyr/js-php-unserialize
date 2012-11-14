js-php-unserialize
==================

[![Build Status](https://secure.travis-ci.org/naholyr/js-php-unserialize.png)](http://travis-ci.org/naholyr/js-php-unserialize)

JavaScript tool to unserialize data taken from PHP. It can parse "serialize()" output, or even serialized sessions data.

Credits
-------

* The PHP unserializer is taken from [kvz](https://github.com/kvz)'s [phpjs](https://github.com/kvz/phpjs) project.
* The session unserializer's idea is taken from [dumpling](https://raw.github.com/st-luke/dumpling/), which is highly limited by its lack of a real unserializer, and has lot of crash cases.

Installation
------------

### Node.js

Install from npm :

```sh
npm install php-unserialize
```

The use it the usual way :

```javascript
var PHPUnserialize = require('php-unserialize');

console.log(PHPUnserialize.unserialize('a:0:{}')); // {}
```

### Browser

[Download tarball from github](https://github.com/naholyr/js-php-unserialize/downloads) and then unarchive this where you want, then you can simply include it in your page :

```html
<script src="/path/to/php-unserialize.js"></script>
<script>
  console.log(PHPUnserialize.unserialize('a:0:{}')); // {}
</script>
```

**Compatibility issues**

This library has been tested server-side only. For example it uses `[].reduce`, so it may not work on some browsers. Do not hesitate to make pull requests to fix it for you favorite browsers :)

### Notes

* Note that `array()` will be converted to `{}` and not `[]`. That can be discussed as `array()` in PHP has various significations. A choice had to be done, but it may change in the future (cf. next point).
* A less obvious conversion is `array('a', 'b')` which will be converted to `{"0": "a", "1": "b"}`. Quite annoying, and it will be fixed if necessary (this means I won't work on this issue unless you really need it, but I agree this is not normal behavior).

Usage
-----

The module exposes two methods:

### `unserialize(string)`

Unserialize output taken from PHP's `serialize()` method.

It currently does not suport objects.

### `unserializeSession(string)`

Unserialize PHP serialized session. PHP uses a weird custom format to serialize session data, something like "`$key1$serializedData1|$key2$serializedData2|…`", this methods will parse this and unserialize chunks so you can have a simple anonymous objects.
