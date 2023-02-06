// hi

import prefTags from './json/preferencestags.json';

function getMissingNutrientsScore(menuItem, missingNutrients) {
  if (menuItem.nutrients === null) {
    return 0;
  }
  const missingNutrientsFormatted = missingNutrients.map((nutrient) => {
    const splitByUnderscore = nutrient.split("_");
    return splitByUnderscore
      .slice(0, splitByUnderscore.length - 1)
      .join(' ')
      .toLowerCase();
  });
  const menuItemNutrientsFormatted = menuItem.nutrients
    .split(', ')
    .map((nutrient) => nutrient.toLowerCase());
  const missingNutrientsScore = missingNutrientsFormatted.filter(
    (nutrient) => menuItemNutrientsFormatted.indexOf(nutrient) > -1,
  ).length;
  return missingNutrientsScore;
}

function getPreferencesScore(menuItem, preferences) {
  const checkedTags = prefTags.filter((tag) => tag.id <= preferences.length && preferences[tag.id - 1]).map((tag) => tag.name.toLowerCase());

  const result = menuItem.tags.split(', ').filter((tag) => checkedTags.indexOf(tag) > -1).length;
  return result;
}

function score(menuItem, missingNutrients, preferences) {
  const missingNutrientsScore = getMissingNutrientsScore(menuItem, missingNutrients);
  const preferencesScore = getPreferencesScore(menuItem, preferences);
  const totalScore = missingNutrientsScore + 50 * preferencesScore;
  return totalScore;
}

function getMissingNutrients(nutrients, recommendation) {
  const result = [];
  const { summary } = nutrients;
  const { micros, macros } = summary;
  const microsMacrosCombined = { ...micros, ...macros };

  for (let key in microsMacrosCombined) {
    if (microsMacrosCombined[key] === null || recommendation[key] === null) {
      continue;
    }
    result.push({
      key,
      value:
        (recommendation[key] - microsMacrosCombined[key]) / recommendation[key]
    });
  }
  result.sort((a, b) => b.value - a.value); // Descending order
  const output = [];
  let count = 0;
  for (const { key, value } of result) {
    if (count === 5) break;
    output.push(key);
    count++;
  }
  return output;
}

export default function rankMenuItems(menuItems, nutrients, recommendation, preferences) {
  const savourySpicyBitterMenuItems = menuItems.filter((item) => {
    function contains(array, elem) {
      return array.indexOf(elem) > -1;
    }
    const tags = item.tags.split(", ").map((tag) => tag.toLowerCase());
    return contains(tags, 'savoury') || contains(tags, 'savory') || contains(tags, 'spicy') || contains(tags, 'bitter');
  });
  const savourySpicyBitterAndFillingMenuItems = savourySpicyBitterMenuItems.filter(
    (item) => item.price >= 4,
  );
  const ranked = savourySpicyBitterAndFillingMenuItems.sort(
    (a, b) =>
      score(b, getMissingNutrients(nutrients, recommendation), preferences) -
      score(a, getMissingNutrients(nutrients, recommendation), preferences)
  );
  return ranked;
}
