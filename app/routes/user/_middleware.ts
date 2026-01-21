import { createRoute } from "honox/factory";

// 公開プロフィールページのキャッシュ設定(ブラウザは1分間キャッシュ, CDNは5分間キャッシュ)
export default createRoute((c, next) => {
  c.header(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=300"
  );
  return next();
});
