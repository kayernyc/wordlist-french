const { conceptualPatterns, consonantPattern, endingsPatterns } = require('./patterns');

const conceptualPatternsKeyRange = (range = conceptualPatterns) => {
  return {
    min: range[0].key, 
    max: range[conceptualPatterns.length -1].key
  };
}

const ruleByKey = (key) => {
  return conceptualPatterns.filter(rule => rule.key === key) 
        || endingsPatterns.filter(rule => rule.key === key) 
        || underfined;
}

const frenchRuleSet = (frenchWord, _) => { // returns the rule object
  const inMatchArray = (testString, ruleObj) => ruleObj.matches.includes(testString);
  const matchesEnding = (testString, ruleObj) => testString.endsWith(ruleObj.rule);

  const ruleMatch = (testString, ruleSetFunction, ruleSet) => { // return rule object    
    for (var i = 0; i < ruleSet.length; i ++) {
      const ruleObj = ruleSet[i];

      if ( ruleSetFunction(testString, ruleObj)) {
        return ruleObj
      }
    }
  
    return false
  };

  const conceptualPatternsMatch = ruleMatch(frenchWord, inMatchArray, conceptualPatterns);

  if (conceptualPatternsMatch !== false) {
    return conceptualPatternsMatch;
  }

  const endingsPatternsMatch = ruleMatch(frenchWord, matchesEnding, endingsPatterns);

  if (endingsPatternsMatch !== false) {
    return endingsPatternsMatch;
  }

  const consonentPatternsMatch = ruleMatch(frenchWord.charAt(frenchWord.length -1), inMatchArray, consonantPattern);

  if (consonentPatternsMatch !== false) {
    return consonentPatternsMatch;
  }

  return false;
}

module.exports = {
  conceptualPatternsKeyRange: conceptualPatternsKeyRange,
  frenchRuleSet: frenchRuleSet,
  ruleByKey: ruleByKey,
}
