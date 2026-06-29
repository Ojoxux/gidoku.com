import type { BookSearchResult } from "../services/rakuten";

export type ScoreReasonType =
  | "isbn_exact_match"
  | "tech_publisher"
  | "title_keyword"
  | "description_keyword"
  | "author_keyword"
  | "negative_title_keyword"
  | "negative_description_keyword"
  | "missing_page_count"
  | "recent_publication"
  | "old_publication";

export interface ScoreReason {
  type: ScoreReasonType;
  label: string;
  score: number;
}

export interface ScoredBookSearchResult extends BookSearchResult {
  techScore: number;
  scoreReasons?: ScoreReason[];
}

interface ScoreContext {
  normalizedQuery: string;
  now: Date;
}

interface ScoreOptions {
  now?: Date;
}

type ScoreRule = (
  book: BookSearchResult,
  context: ScoreContext
) => ScoreReason[];

const SCORE = {
  isbnExactMatch: 100,
  techPublisher: 30,
  titleKeyword: 15,
  descriptionKeyword: 6,
  authorKeyword: 4,
  negativeTitleKeyword: -40,
  negativeDescriptionKeyword: -15,
  missingPageCount: -5,
  publishedWithinOneYear: 12,
  publishedWithinThreeYears: 8,
  publishedWithinFiveYears: 4,
  publishedOverTenYearsAgo: -5,
} as const;

const TECH_PUBLISHERS = [
  "技術評論社",
  "翔泳社",
  "オライリー・ジャパン",
  "オライリージャパン",
  "インプレス",
  "日経BP",
  "SBクリエイティブ",
  "マイナビ出版",
  "オーム社",
  "ラムダノート",
  "達人出版会",
  "秀和システム",
  "ソシム",
  "共立出版",
  "森北出版",
  "近代科学社",
  "東京電機大学出版局",
  "工学社",
  "CQ出版",
  "リックテレコム",
];

const TECH_KEYWORDS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Ruby",
  "PHP",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C#",
  "Swift",
  "Kotlin",
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Nuxt",
  "Node.js",
  "Deno",
  "Hono",
  "フロントエンド",
  "バックエンド",
  "プログラミング",
  "コード",
  "コーディング",
  "リファクタリング",
  "ソフトウェア",
  "アプリケーション",
  "Web開発",
  "Web",
  "API",
  "HTTP",
  "REST",
  "GraphQL",
  "SQL",
  "データベース",
  "DB",
  "SQLite",
  "MySQL",
  "PostgreSQL",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Cloudflare",
  "Docker",
  "Kubernetes",
  "Linux",
  "Unix",
  "Git",
  "GitHub",
  "CI/CD",
  "DevOps",
  "インフラ",
  "サーバ",
  "ネットワーク",
  "セキュリティ",
  "暗号",
  "認証",
  "設計",
  "アーキテクチャ",
  "ドメイン駆動",
  "DDD",
  "テスト駆動",
  "TDD",
  "クリーンアーキテクチャ",
  "アルゴリズム",
  "データ構造",
  "コンピュータサイエンス",
  "機械学習",
  "生成AI",
  "AI",
  "深層学習",
  "ディープラーニング",
  "データ分析",
  "統計",
  "数学",
  "情報処理",
  "基本情報",
  "応用情報",
  "エンジニア",
  "ハッカー",
];

const NEGATIVE_KEYWORDS = [
  "漫画",
  "コミック",
  "小説",
  "文庫",
  "ライトノベル",
  "ラノベ",
  "絵本",
  "児童書",
  "レシピ",
  "料理",
  "旅行",
  "観光",
  "占い",
  "恋愛",
  "美容",
  "健康",
  "筋トレ",
  "ダイエット",
  "写真集",
  "攻略本",
  "ゲーム攻略",
  "雑誌",
  "ムック",
];

const SCORE_RULES: ScoreRule[] = [
  matchExactIsbn,
  matchTechPublisher,
  matchTitleKeywords,
  matchDescriptionKeywords,
  matchAuthorKeywords,
  penalizeNegativeTitleKeywords,
  penalizeNegativeDescriptionKeywords,
  penalizeMissingPageCount,
  scorePublicationRecency,
];

export function rankTechBooks(
  books: BookSearchResult[],
  query: string,
  options: { includeReasons?: boolean; now?: Date } = {}
): ScoredBookSearchResult[] {
  return books
    .map((book) => {
      const result = calculateTechScore(book, query, { now: options.now });
      const scoredBook: ScoredBookSearchResult = {
        ...book,
        techScore: result.techScore,
      };

      if (options.includeReasons) {
        scoredBook.scoreReasons = result.scoreReasons;
      }

      return scoredBook;
    })
    .sort((before, after) => {
      if (before.techScore !== after.techScore) {
        return after.techScore - before.techScore;
      }

      return comparePublishedDateDesc(before.publishedDate, after.publishedDate);
    });
}

export function calculateTechScore(
  book: BookSearchResult,
  query: string,
  options: ScoreOptions = {}
): { techScore: number; scoreReasons: ScoreReason[] } {
  const context: ScoreContext = {
    normalizedQuery: normalizeIsbn(query),
    now: options.now ?? new Date(),
  };
  const scoreReasons = SCORE_RULES.flatMap((rule) => rule(book, context));

  return {
    techScore: scoreReasons.reduce((total, reason) => total + reason.score, 0),
    scoreReasons,
  };
}

function matchExactIsbn(
  book: BookSearchResult,
  context: ScoreContext
): ScoreReason[] {
  const normalizedBookIsbn = normalizeIsbn(book.isbn);

  if (context.normalizedQuery && normalizedBookIsbn === context.normalizedQuery) {
    return [
      {
        type: "isbn_exact_match",
        label: book.isbn,
        score: SCORE.isbnExactMatch,
      },
    ];
  }

  return [];
}

function matchTechPublisher(book: BookSearchResult): ScoreReason[] {
  const publisher = TECH_PUBLISHERS.find((publisherName) =>
    includesNormalized(book.publisher, publisherName)
  );
  if (!publisher) return [];

  return [
    {
      type: "tech_publisher",
      label: publisher,
      score: SCORE.techPublisher,
    },
  ];
}

function matchTitleKeywords(book: BookSearchResult): ScoreReason[] {
  return getKeywordReasons(book.title, TECH_KEYWORDS, {
    type: "title_keyword",
    score: SCORE.titleKeyword,
  });
}

function matchDescriptionKeywords(book: BookSearchResult): ScoreReason[] {
  return getKeywordReasons(book.description, TECH_KEYWORDS, {
    type: "description_keyword",
    score: SCORE.descriptionKeyword,
  });
}

function matchAuthorKeywords(book: BookSearchResult): ScoreReason[] {
  return getKeywordReasons(book.authors.join(" "), TECH_KEYWORDS, {
    type: "author_keyword",
    score: SCORE.authorKeyword,
  });
}

function penalizeNegativeTitleKeywords(book: BookSearchResult): ScoreReason[] {
  return getKeywordReasons(book.title, NEGATIVE_KEYWORDS, {
    type: "negative_title_keyword",
    score: SCORE.negativeTitleKeyword,
  });
}

function penalizeNegativeDescriptionKeywords(
  book: BookSearchResult
): ScoreReason[] {
  return getKeywordReasons(book.description, NEGATIVE_KEYWORDS, {
    type: "negative_description_keyword",
    score: SCORE.negativeDescriptionKeyword,
  });
}

function penalizeMissingPageCount(book: BookSearchResult): ScoreReason[] {
  if (book.pageCount !== 0) return [];

  return [
    {
      type: "missing_page_count",
      label: "pageCount",
      score: SCORE.missingPageCount,
    },
  ];
}

function scorePublicationRecency(
  book: BookSearchResult,
  context: ScoreContext
): ScoreReason[] {
  const recencyReason = getPublicationRecencyReason(
    book.publishedDate,
    context.now
  );

  return recencyReason ? [recencyReason] : [];
}

function getKeywordReasons(
  text: string,
  keywords: string[],
  reason: { type: ScoreReasonType; score: number }
): ScoreReason[] {
  return keywords
    .filter((keyword) => hasKeyword(text, keyword))
    .map((keyword) => ({
      type: reason.type,
      label: keyword,
      score: reason.score,
    }));
}

function hasKeyword(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;

  const normalizedKeyword = keyword.toLowerCase();

  if (isAsciiKeyword(normalizedKeyword)) {
    return new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`
    ).test(text.toLowerCase());
  }

  const normalizedText = normalizeText(text);
  return normalizedText.includes(normalizedKeyword);
}

function includesNormalized(text: string, query: string): boolean {
  return normalizeText(text).includes(normalizeText(query));
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function normalizeIsbn(value: string): string {
  return value.replace(/[^0-9xX]/g, "").toUpperCase();
}

function isAsciiKeyword(value: string): boolean {
  return /^[a-z0-9#+.]+$/.test(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPublicationRecencyReason(
  publishedDate: string,
  now: Date
): ScoreReason | null {
  const date = parsePublishedDate(publishedDate);
  if (!date) return null;

  const elapsedYears = yearsBetween(date, now);

  if (elapsedYears <= 1) {
    return {
      type: "recent_publication",
      label: "1年以内",
      score: SCORE.publishedWithinOneYear,
    };
  }

  if (elapsedYears <= 3) {
    return {
      type: "recent_publication",
      label: "3年以内",
      score: SCORE.publishedWithinThreeYears,
    };
  }

  if (elapsedYears <= 5) {
    return {
      type: "recent_publication",
      label: "5年以内",
      score: SCORE.publishedWithinFiveYears,
    };
  }

  if (elapsedYears >= 10) {
    return {
      type: "old_publication",
      label: "10年以上前",
      score: SCORE.publishedOverTenYearsAgo,
    };
  }

  return null;
}

function yearsBetween(start: Date, end: Date): number {
  const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (end.getTime() - start.getTime()) / millisecondsPerYear;
}

function comparePublishedDateDesc(before: string, after: string): number {
  const beforeDate = parsePublishedDate(before);
  const afterDate = parsePublishedDate(after);

  if (!beforeDate && !afterDate) return 0;
  if (!beforeDate) return 1;
  if (!afterDate) return -1;

  return afterDate.getTime() - beforeDate.getTime();
}

function parsePublishedDate(publishedDate: string): Date | null {
  if (!publishedDate) return null;

  const match = publishedDate.match(/(\d{4})年(?:\s*(\d{1,2})月)?(?:\s*(\d{1,2})日)?/);
  if (!match) return null;

  const [, year, month, day] = match;

  return new Date(Number(year), Number(month ?? 1) - 1, Number(day ?? 1));
}
