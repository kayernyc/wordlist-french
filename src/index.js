#!/usr/bin/env node

const fs = require('fs')
const { Transform } = require('stream')
const readlineSync = require('readline-sync')

const { conceptualPatternsKeyRange, frenchRuleSet, ruleByKey } = require('./rules')

const {min: validRuleRangeMin, max: validRuleRangeMax} = conceptualPatternsKeyRange()

const numbericRange = (start, end, length = end - start) => Array.from({length}, (_, i) => start + i)
const validConceptualRulesRange = numbericRange(validRuleRangeMin, validRuleRangeMax  + 1)

const ENCODING = 'utf8'

const getRuleNumberInput = (frenchSet) => {
  let conceptualRule = undefined;
  let confirmed = false;

  while (confirmed === false) {
    if (conceptualRule === undefined) {
      let conceptualRuleKey = readlineSync.question(
      `choose a rule key between ${validRuleRangeMin} and ${validRuleRangeMax} for ${frenchSet[0]} ${frenchSet[1]}: `, 
      {
        limit: validConceptualRulesRange,
      })

      let proposedConceptualRule = ruleByKey(parseInt(conceptualRuleKey, 10))[0]
      if (proposedConceptualRule !== undefined) {
        conceptualRule = proposedConceptualRule
      }
      
    } else {
      confirmed = readlineSync.keyInYN('is this correct?')
      if (!confirmed) {
        conceptualRule = undefined;
        continue
      } else {
        console.log('=====', conceptualRule)
        return conceptualRule
      }
    }
  }
}

const frenchRecord = async (frenchSet) => {
  let gender = 0
  let genderRule = false
  let genderException = false
  let word = false

  if (frenchSet.length > 1) {
    word = frenchSet[1]
    if (frenchSet[0] === 'la' || frenchSet[0] === 'une') {
      gender = 1;
    }

  } else {
    // TODO: throw error
    return
  }

  if (gender < 2) {
    genderRule = frenchRuleSet(word, gender)
    
    if (genderRule === false) {
      try {
        genderRule = await getRuleNumberInput(frenchSet).gender
      } catch (err) {
        throw new Error(`error: ${err} from ${frenchSet}`)
      }
      
    }
  }

  genderException = genderRule.gender === gender ? true : false

  return `"french": "${word}", "gender" : "${gender}", "genderRule" : "${genderRule}", "exception" : "${genderException}"\n`
}

const parseLine = async line => {
  const processedArray = line
    .split('-')

  if (processedArray[1] !== undefined) {
    try {
      const frenchString = await frenchRecord(processedArray[1].trim().split(' '))
      return Promise.resolve(frenchString);
    } catch (error) {
      throw error
    }
  } else {
    throw new Error(`NO FRENCH VALUE: ${processedArray}`);
  }
}

// convert data chunck
const convertDataChunk = async (chunk) => {
  return Promise.all(chunk.toString()
    .split(/\r?\n/)
    .map(async line => {
      try {
        let parsedLine =  await parseLine(line)
        return parsedLine
      } catch (err) {
        throw new Error(`line ${line}`)
      }
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
          file += line
        }
      })

      this.push(file)
      callback(null, file);
    })
    .catch(err => {
      callback(err, null);
    });
}});

const writeDest = fs.createWriteStream('text/french-nouns.txt')

// Read file
async function readFile(url = 'text/wordlist.txt') {
  let data = fs
    .createReadStream(url)
    .pipe(transform)
    .pipe(writeDest)
}

readFile()