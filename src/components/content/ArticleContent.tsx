"use client";

import { ContentItem } from "@/types/content";
import { SectionRenderer } from "./SectionRenderer";

interface ArticleContentProps {
  article: ContentItem;
}

export function ArticleContent({ article }: ArticleContentProps) {
  // If article has sections (modular JSON), render them
  if (article.sections && article.sections.length > 0) {
    return (
      <div className="space-y-8">
        {article.sections.map((section, index) => (
          <SectionRenderer key={index} section={section} />
        ))}

        {/* Related Topics */}
        {article.relatedTopics && article.relatedTopics.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              相关主题
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.relatedTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800
                             text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to HTML content (from markdown)
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none
                        prose-headings:scroll-mt-24
                        prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                        prose-p:text-gray-600 prose-p:dark:text-gray-300 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:dark:text-blue-400 prose-a:no-underline
                        prose-a:hover:underline
                        prose-code:bg-gray-100 prose-code:dark:bg-gray-800
                        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-gray-900 prose-pre:dark:bg-gray-950
                        prose-pre:border prose-pre:border-gray-200 prose-pre:dark:border-gray-800
                        prose-pre:rounded-xl prose-pre:shadow-sm
                        prose-table:border-collapse prose-table:w-full
                        prose-th:bg-gray-50 prose-th:dark:bg-gray-800
                        prose-th:px-4 prose-th:py-2 prose-th:text-left
                        prose-th:border prose-th:border-gray-200 prose-th:dark:border-gray-700
                        prose-td:px-4 prose-td:py-2
                        prose-td:border prose-td:border-gray-200 prose-td:dark:border-gray-700
                        prose-ul:my-4 prose-ol:my-4
                        prose-li:my-1
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                        prose-blockquote:bg-blue-50 prose-blockquote:dark:bg-blue-900/20
                        prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                        prose-blockquote:not-italic">
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
      />
    </article>
  );
}
