-- サンプルデータ投入用SQL
-- 開発環境でのテスト用

-- サンプルユーザー
INSERT OR IGNORE INTO users (id, username, email, name, bio, avatar_url, provider, provider_id, created_at, updated_at)
VALUES ('user-1', 'testuser', 'test@example.com', 'Test User', '技術書を読むのが好きです', 'https://avatars.githubusercontent.com/u/1?v=4', 'github', '12345', datetime('now'), datetime('now'));

-- サンプル書籍1
INSERT OR IGNORE INTO books (
  id, user_id, title, authors, publisher, published_date, isbn,
  page_count, description, thumbnail_url, status, current_page,
  memo, created_at, updated_at
) VALUES (
  'book-1', 'user-1', 'リーダブルコード', 
  '["Dustin Boswell", "Trevor Foucher"]',
  'オライリージャパン', '2012-06-23', '9784873115658',
  260, 'より良いコードを書くためのシンプルで実践的なテクニック',
  'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/5658/9784873115658.jpg',
  'reading', 120, '第3章まで読了。命名規則が参考になる',
  datetime('now'), datetime('now')
);

-- サンプル書籍2
INSERT OR IGNORE INTO books (
  id, user_id, title, authors, publisher, published_date, isbn,
  page_count, description, thumbnail_url, status, current_page,
  created_at, updated_at
) VALUES (
  'book-2', 'user-1', 'プログラマのためのSQL 第4版',
  '["Joe Celko"]',
  '翔泳社', '2015-09-16', '9784798142678',
  528, 'SQLの基礎から高度なテクニックまで',
  'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/2678/9784798142678.jpg',
  'completed', 528, datetime('now'), datetime('now')
);

-- サンプルタグ
INSERT OR IGNORE INTO tags (id, user_id, name, created_at)
VALUES ('tag-1', 'user-1', '設計', datetime('now'));

INSERT OR IGNORE INTO tags (id, user_id, name, created_at)
VALUES ('tag-2', 'user-1', 'データベース', datetime('now'));

-- 書籍-タグの関連付け
INSERT OR IGNORE INTO book_tags (book_id, tag_id)
VALUES ('book-1', 'tag-1');

INSERT OR IGNORE INTO book_tags (book_id, tag_id)
VALUES ('book-2', 'tag-2');
