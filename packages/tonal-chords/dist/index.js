'use strict';

var tonalPitches = require('tonal-pitches');
var tonalCollections = require('tonal-arrays');
var noteParser = require('note-parser');

var raw = require('./chords.json');

var DATA = Object.keys(raw).reduce(function (d, k) {
  // add intervals
  d[k] = raw[k][0].split(' ').map(tonalPitches.parseIvl);
  // add alias
  if (raw[k][1]) raw[k][1].forEach(function (a) {
    d[a] = k;
  });
  return d;
}, {});

/**
 * Create chords by chord type or intervals and tonic. The returned chord is an
 * array of notes (or intervals if you specify `false` as tonic)
 *
 * This function is currified
 *
 * @param {String} source - the chord type, intervals or notes
 * @param {String} tonic - the chord tonic (or false to get intervals)
 * @return {Array} the chord notes
 *
 * @example
 * import { chord } from 'tonal-chords'
 * // get chord notes using type and tonic
 * chord('maj7', 'C2') // => ['C2', 'E2', 'G2', 'B2']
 * // get chord intervals (tonic false)
 * chord('maj7', false) // => ['1P', '3M', '5P', '7M']
 * // partially applied
 * const maj7 = chord('maj7')
 * maj7('C') // => ['C', 'E', 'G', 'B']
 * // create chord from intervals
 * chord('1 3 5 m7 m9', 'C') // => ['C', 'E', 'G', 'Bb', 'Db']
 */
function chord(source, tonic) {
  if (arguments.length > 1) return chord(source)(tonic);
  var intervals = DATA[source];
  if (typeof intervals === 'string') intervals = DATA[intervals];
  return tonalCollections.harmonizer(intervals || source);
}

/**
 * Get chord notes from chord name
 *
 * @param {String} name - the chord name
 * @return {Array} the chord notes
 *
 * @example
 * import { fromName } from 'tonal-chords'
 * fromName('C7') // => ['C', 'E', 'G', 'Bb']
 * fromName('CMaj7') // => ['C', 'E', 'G', 'B']
 */
function fromName(name) {
  var p = noteParser.regex().exec(name);
  if (!p) return [];
  // it has note and chord name
  if (p[4]) return chord(p[4], p[1] + p[2] + p[3]);
  // doesn't have chord name: the name is the octave (example: 'C7' is dominant)
  return chord(p[3], p[1] + p[2]);
}

/**
 * Return the available chord names
 *
 * @param {boolean} aliases - true to include aliases
 * @return {Array} the chord names
 *
 * @example
 * import { names } from 'tonal-chords'
 * names() // => ['maj7', ...]
 */
function names(aliases) {
  if (aliases) return Object.keys(DATA);
  return Object.keys(DATA).reduce(function (names, name) {
    if (Array.isArray(DATA[name])) names.push(name);
    return names;
  }, []);
}

exports.DATA = DATA;
exports.chord = chord;
exports.fromName = fromName;
exports.names = names;