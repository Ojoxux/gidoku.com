import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import api from "./server/api";

const app = createApp();

// セキュリティヘッダー設定
app.use(
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://api.github.com",
        "https://accounts.google.com",
      ],
    },
  })
);

// CSRF保護（Origin/Sec-Fetch-Site検証）
app.use(
  csrf({
    origin: (origin, c) => {
      const appUrl = c.env?.APP_URL;
      if (!appUrl) return false;
      // 本番URLとlocalhost（開発環境）を許可
      const allowedOrigins = [appUrl, "http://localhost:5173"];
      return allowedOrigins.includes(origin);
    },
  })
);

app.route("/api", api);

showRoutes(app);

export default app;
