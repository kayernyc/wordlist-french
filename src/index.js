#!/usr/bin/env node

const fs = require('fs')
const { Transform } = require('stream')
const readlineSync = require('readline-sync')

const { conceptualPatternsKeyRange, frenchRuleSet, ruleByKey } = require('./rules')

const {min: validRuleRangeMin, max: validRuleRangeMax} = conceptualPatternsKeyRange()

const numbericRange = (start, end, length = end - start) => Array.from({length}, (_, i) => start + i)
const validConceptualRulesRange = numbericRange(validRuleRangeMin, validRuleRangeMax  + 1)

const ENCODING = 'utf8'

const validateRuleResponse = (conceptualRuleKey) => {
  const rule = ruleByKey(conceptualRuleKey)[0];
  let confirm = readlineSync.question('confirm? y/n ')
  
  if (confirm === 'y' || confirm === 'Y' || confirm === 'true') {
    // return true;
  }

  // return false;
}

const getRuleNumberInput = (frenchSet) => {
  console.log(frenchSet, 'No rule based on endings.')
  let conceptualRuleKey = undefined;
  let confirmed = false;

  while (confirmed === false) {
    console.log(`confirmed ${confirmed}`)
    if (conceptualRuleKey === undefined) {
      conceptualRuleKey = readlineSync.questionInt([`choose a rule key between ${validRuleRangeMin} and ${validRuleRangeMax} `, validConceptualRulesRange])
    } else {
      confirmed = readlineSync.keyInYN('is this correct?')
      conceptualRuleKey = undefined;
      console.log(typeof confirmed, confirmed);
    }

    if (conceptualRuleKey !== undefined && confirmed) {
      return true
    }
  }
}

const frenchRecord = async (frenchSet) => {
  let gender = 0;
  let genderRule = false;
  let genderException = false;
  let word = false

  if (frenchSet.length > 1) {
    word = frenchSet[1]
    if (frenchSet[0] === 'la' || frenchSet[0] === 'une') {
      gender = 1;
    }

  } else {
    // throw error
    return
  }

  if (gender < 2) {
    genderRule = frenchRuleSet(word, gender)
    
    if (genderRule === false) {

      const conceptualRuleKey = getRuleNumberInput(frenchSet);

      if (genderException === false) {         
        if (validateRuleResponse(conceptualRuleKey)) {
          console.log('do i get here 2')
          genderRule = rule.key;
          console.log('do i get here 3')
          genderException = rule.gender === gender ? true : false;
          console.log('do i get here')
          const value = `"french": "${word}", "gender" : "${gender}", "genderRule" : "${genderRule}", "exception" : "${genderException}"\n`
          console.log(value)
          // return value
        }
      } else {
        console.log('conceptual rule key', conceptualRuleKey)
        
      }
    } 
  } else {
    return `"french": "${word}", "gender" : "${gender}", "genderRule" : "${genderRule}", "exception" : "${genderException}"\n`
  }
}

const parseLine = async line => {
  const processedArray = line
    .substr(line.indexOf(' ') + 1)
    .split('-')

  if (processedArray[1] !== undefined) {
    const frenchString = await frenchRecord(processedArray[1].trim().split(' '))
    return Promise.resolve(frenchString);

  } else {
    throw new Error(`NO FRENCH VALUE: ${processedArray}`);
  }
}

// convert data chunck
const convertDataChunk = async (chunk) => {
  return Promise.all(chunk.toString()
    .split(/\r?\n/)
    .map(async line => {
      console.log(line)
      let dude =  await parseLine(line)
      console.log('line await')
      return dude
    })
    .catch(err => {
      console.warn(`in here ${err}`)
    })
    .then(data => data)
    .catch(err => {
      console.warn(`in there ${err}`)
    })
  );
}

// transform
const transform = new Transform({transform(chunk, _, callback) {
  convertDataChunk(chunk)
    .then(data => {
      let file = new String()
      
      data.forEach(line => {
        if (line.length > 0) {
          console.log('--', line)
          file += line
        }
      })

      this.push(file)
      callback();
    })
    .catch(err => {
      console.warn('am i handled?')
      callback();
    });
}});

function readStreamPromise (stream, encoding = ENCODING) {
  stream.setEncoding(encoding);

  return new Promise((resolve, reject) => {
    let data = '';

    stream.on('data', chunk => data += chunk);
    stream.on('end', () => resolve(data));
    stream.on('error', error => reject(error));
  });
}

// Read file
async function readFile(url = 'text/wordlist.txt') {
  const foobar = fs
    .createReadStream(url)
    .pipe(transform)
  /*
  fs
    .createReadStream('./wordlist.txt')
    .pipe(transform)
    .pipe(dest);
  */

  const text = await readStreamPromise(foobar);
  // send to next function

  // console.log(`text - ${text}`)
}

readFile()