import prisma from "../config/database.js";

// Normalize text consistently before matching.
const normalizeText = (value) =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

// Escape special characters so keywords are treated as literal text.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Match a keyword or phrase without matching it inside a larger word.
const containsKeyword = (text, keyword) => {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapeRegex(normalizedKeyword)}(?=$|[^\\p{L}\\p{N}])`,
    "u",
  );

  return pattern.test(text);
};

// ============================================================
// CLASSIFY CLIENT FEEDBACK
// ============================================================

export const classifyClientFeedback = async (description) => {
  const normalizedDescription = normalizeText(description);

  if (!normalizedDescription) {
    return null;
  }

  // Only use keywords from active categories and departments.
  const keywords = await prisma.categoryKeyword.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
        department: {
          isActive: true,
        },
      },
    },
    select: {
      keyword: true,
      weight: true,
      category: {
        select: {
          id: true,
          name: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  // Accumulate matching keyword weights for each category.
  const categoryScores = new Map();

  for (const item of keywords) {
    if (!containsKeyword(normalizedDescription, item.keyword)) {
      continue;
    }

    const category = item.category;

    if (!categoryScores.has(category.id)) {
      categoryScores.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        department: category.department,
        score: 0,
        matchedKeywords: [],
      });
    }

    const result = categoryScores.get(category.id);

    result.score += item.weight;
    result.matchedKeywords.push({
      keyword: item.keyword,
      weight: item.weight,
    });
  }

  // Rank categories by score, with a stable name-based tie-breaker.
  const rankedCategories = [...categoryScores.values()].sort(
    (a, b) => b.score - a.score || a.categoryName.localeCompare(b.categoryName),
  );

  if (rankedCategories.length === 0) {
    return null;
  }

  const bestMatch = rankedCategories[0];

  return {
    categoryId: bestMatch.categoryId,
    categoryName: bestMatch.categoryName,
    department: bestMatch.department,
    score: bestMatch.score,
    matchedKeywords: bestMatch.matchedKeywords,
    alternatives: rankedCategories.slice(1, 4).map((category) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      department: category.department,
      score: category.score,
      matchedKeywords: category.matchedKeywords,
    })),
  };
};
