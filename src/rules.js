const { conceptualPatterns, endingsPatterns } = require('./patterns');

const conceptualPatternsKeyRange = (range = conceptualPatterns) => {
  return {
    min: conceptualPatterns[0].key, 
    max: conceptualPatterns[conceptualPatterns.length -1].key
  };
}

const ruleByKey = (key) => {
  return conceptualPatterns.filter(rule => rule.key === key) 
        || endingsPatterns.filter(rule => rule.key === key) 
        || underfined;
}

const frenchRuleSet = (frenchWord, gender) => {
  const matchesConceptRule = (frenchWord, ruleObj) => ruleObj.matches.includes(frenchWord);
  const matchesEnding = (frenchWord, ruleObj) => frenchWord.endsWith(ruleObj.rule);

  const ruleMatch = (ruleSetFunction, ruleSet) => { // return tuple
    
    for (var i = 0; i < ruleSet.length; i ++) {
      const ruleObj = ruleSet[i];

      if ( ruleSetFunction(frenchWord, ruleObj)) {
        return [ruleObj.key,  (gender === ruleObj.gender)]
      }
    }
  
    return false
  };

  const conceptualPatternsMatch = ruleMatch(matchesConceptRule, conceptualPatterns);

  if (conceptualPatternsMatch !== false) {
    return conceptualPatternsMatch;
  }

  const endingsPatternsMatch = ruleMatch(matchesEnding, endingsPatterns);

  if (endingsPatternsMatch !== false) {
    return endingsPatternsMatch;
  }

  return false;
}

module.exports = {
  conceptualPatternsKeyRange: conceptualPatternsKeyRange,
  frenchRuleSet: frenchRuleSet,
  ruleByKey: ruleByKey,
}
