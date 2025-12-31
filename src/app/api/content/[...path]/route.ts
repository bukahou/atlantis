import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

/**
 * 动态生成文章索引（替代 build 脚本生成的 _index.json）
 */
function generateArticleIndex(
  locale: string,
  category: string,
  subcategory: string
): { items: Array<{ slug: string; title: string; description: string; href: string; order: number }> } {
  const dir = path.join(CONTENT_DIR, locale, category, subcategory);

  if (!fs.existsSync(dir)) {
    return { items: [] };
  }

  const files = fs.readdirSync(dir).filter((f) => {
    return f.endsWith(".json") && !f.startsWith("_");
  });

  const items = files
    .map((f) => {
      const filePath = path.join(dir, f);
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      const slug = f.replace(".json", "");

      return {
        slug,
        title: data.meta?.title || slug,
        description: data.meta?.description || "",
        href: `/${category}/${subcategory}/${slug}`,
        order: data.meta?.order || 999,
      };
    })
    .sort((a, b) => a.order - b.order);

  return { items };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // 路径格式: /api/content/{locale}/{category}/{subcategory}/{file}.json
  // 例如: /api/content/ja/database/distributed/_overview.json
  const fileName = pathSegments[pathSegments.length - 1];

  // 特殊处理 _index.json - 动态生成
  if (fileName === "_index.json" && pathSegments.length === 4) {
    const [locale, category, subcategory] = pathSegments;
    const indexData = generateArticleIndex(locale, category, subcategory);

    return NextResponse.json(indexData, {
      headers: {
        "Cache-Control": process.env.NODE_ENV === "production"
          ? "public, max-age=3600, s-maxage=3600"
          : "no-cache",
      },
    });
  }

  const filePath = path.join(CONTENT_DIR, ...pathSegments);

  // 安全检查：确保路径在 CONTENT_DIR 内
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(CONTENT_DIR)) {
    return NextResponse.json(
      { error: "Invalid path" },
      { status: 400 }
    );
  }

  // 检查文件是否存在
  if (!fs.existsSync(resolvedPath)) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }

  try {
    const content = fs.readFileSync(resolvedPath, "utf-8");
    const data = JSON.parse(content);

    return NextResponse.json(data, {
      headers: {
        // 开发环境不缓存，生产环境缓存 1 小时
        "Cache-Control": process.env.NODE_ENV === "production"
          ? "public, max-age=3600, s-maxage=3600"
          : "no-cache",
      },
    });
  } catch (error) {
    console.error(`Failed to read content: ${resolvedPath}`, error);
    return NextResponse.json(
      { error: "Failed to read content" },
      { status: 500 }
    );
  }
}
