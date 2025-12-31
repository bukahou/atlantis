import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "../src/content");
const OUTPUT_DIR = path.join(__dirname, "../public/content");

const locales = ["zh", "ja"];

async function processMarkdown(content) {
  const result = await remark().use(gfm).use(html).process(content);
  return result.toString();
}

async function buildContent() {
  console.log("Building content...");

  // Ensure output directory exists
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const locale of locales) {
    const localeDir = path.join(CONTENT_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;

    const categories = fs.readdirSync(localeDir).filter((item) => {
      return fs.statSync(path.join(localeDir, item)).isDirectory();
    });

    for (const category of categories) {
      const categoryDir = path.join(localeDir, category);
      const subcategories = fs.readdirSync(categoryDir).filter((item) => {
        return fs.statSync(path.join(categoryDir, item)).isDirectory();
      });

      for (const subcategory of subcategories) {
        const subcategoryDir = path.join(categoryDir, subcategory);
        const files = fs.readdirSync(subcategoryDir).filter((f) => {
          return f.endsWith(".md") && !f.startsWith("_");
        });

        // Check if JSON overview exists (new format)
        const jsonOverviewPath = path.join(subcategoryDir, "_overview.json");
        const hasJsonOverview = fs.existsSync(jsonOverviewPath);

        // Check for JSON article files
        const allJsonFiles = fs.readdirSync(subcategoryDir).filter((f) => {
          return f.endsWith(".json") && !f.startsWith("_");
        });

        // Skip if no content (no md files, no json files, and no json overview)
        if (files.length === 0 && allJsonFiles.length === 0 && !hasJsonOverview) continue;

        const articles = [];
        const articleOutputDir = path.join(
          OUTPUT_DIR,
          locale,
          category,
          subcategory
        );
        fs.mkdirSync(articleOutputDir, { recursive: true });

        // Process overview - prefer JSON format, fallback to markdown
        if (hasJsonOverview) {
          // Copy JSON overview directly
          const jsonContent = fs.readFileSync(jsonOverviewPath, "utf-8");
          fs.writeFileSync(
            path.join(articleOutputDir, "_overview.json"),
            jsonContent
          );
        } else {
          // Fallback: Process markdown overview
          const mdOverviewPath = path.join(subcategoryDir, "_overview.md");
          if (fs.existsSync(mdOverviewPath)) {
            const overviewContent = fs.readFileSync(mdOverviewPath, "utf-8");
            const { data, content } = matter(overviewContent);
            const htmlContent = await processMarkdown(content);

            const overview = {
              meta: {
                title: data.title || subcategory,
                description: data.description || "",
                keyPoints: data.keyPoints || [],
                relatedTopics: data.relatedTopics || [],
              },
              content: htmlContent,
            };

            fs.writeFileSync(
              path.join(articleOutputDir, "_overview.json"),
              JSON.stringify(overview, null, 2)
            );
          }
        }

        // Use the JSON files we already collected
        const jsonFiles = allJsonFiles;

        // Process JSON article files first
        for (const file of jsonFiles) {
          const filePath = path.join(subcategoryDir, file);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const jsonData = JSON.parse(fileContent);
          const slug = file.replace(/\.json$/, "");

          // JSON article format: { meta, sections, relatedTopics }
          const article = {
            slug,
            meta: {
              title: jsonData.meta?.title || slug,
              description: jsonData.meta?.description || "",
              order: jsonData.meta?.order || 999,
              tags: jsonData.meta?.tags || [],
            },
            sections: jsonData.sections || [],
            relatedTopics: jsonData.relatedTopics || [],
          };

          articles.push(article);

          // Save individual article
          fs.writeFileSync(
            path.join(articleOutputDir, `${slug}.json`),
            JSON.stringify(article, null, 2)
          );
        }

        // Process markdown article files (skip if JSON version exists)
        for (const file of files) {
          const slug = file.replace(/\.md$/, "");

          // Skip if JSON version already processed
          if (jsonFiles.includes(`${slug}.json`)) continue;

          const filePath = path.join(subcategoryDir, file);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const { data, content } = matter(fileContent);
          const htmlContent = await processMarkdown(content);

          const article = {
            slug,
            meta: {
              title: data.title || slug,
              description: data.description || "",
              order: data.order || 999,
              tags: data.tags || [],
            },
            content: htmlContent,
          };

          articles.push(article);

          // Save individual article
          fs.writeFileSync(
            path.join(articleOutputDir, `${slug}.json`),
            JSON.stringify(article, null, 2)
          );
        }

        // Save navigation index (only if there are articles)
        if (articles.length > 0) {
          const navItems = articles
            .map((a) => ({
              slug: a.slug,
              title: a.meta.title,
              description: a.meta.description,
              href: `/${category}/${subcategory}/${a.slug}`,
              order: a.meta.order,
            }))
            .sort((a, b) => a.order - b.order);

          fs.writeFileSync(
            path.join(articleOutputDir, "_index.json"),
            JSON.stringify({ items: navItems }, null, 2)
          );
        }

        const overviewType = hasJsonOverview ? "JSON" : "MD";
        const jsonCount = jsonFiles.length;
        const mdCount = files.filter(f => !jsonFiles.includes(f.replace(/\.md$/, ".json"))).length;
        console.log(
          `  Built: ${locale}/${category}/${subcategory} (${jsonCount} JSON + ${mdCount} MD articles, ${overviewType} overview)`
        );
      }
    }
  }

  console.log("Content build complete!");
}

buildContent().catch(console.error);
