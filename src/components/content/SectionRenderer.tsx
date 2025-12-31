"use client";

import {
  CheckCircle2,
  Star,
  Zap,
  Target,
  ArrowRight,
  ChevronRight,
  Circle,
  Check,
} from "lucide-react";
import type {
  ContentSection,
  KeyPointsSection,
  ComparisonSection,
  FlowSection,
  CardsSection,
  TableSection,
  ListSection,
  TextSection,
} from "@/types/overview";

interface SectionRendererProps {
  section: ContentSection;
  colorClass?: string;
  locale?: string;
}

const keyPointIcons = [CheckCircle2, Star, Zap, Target];

// KeyPoints Component - 2x2 grid with icons
function KeyPointsRenderer({
  section,
  colorClass,
}: {
  section: KeyPointsSection;
  colorClass: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {section.items.map((point, index) => {
        const IconComponent = keyPointIcons[index % keyPointIcons.length];
        return (
          <div
            key={index}
            className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800
                       rounded-xl border border-gray-200 dark:border-gray-700
                       shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center
                          rounded-xl bg-gradient-to-br ${colorClass} shadow-sm`}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
              {point}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Comparison Component - Side by side columns
function ComparisonRenderer({
  section,
  colorClass,
}: {
  section: ComparisonSection;
  colorClass: string;
}) {
  const columnColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
  ];

  const gridColsClass = section.columns.length === 2
    ? "md:grid-cols-2"
    : section.columns.length === 3
    ? "md:grid-cols-3"
    : "md:grid-cols-4";

  return (
    <div className={`grid gap-6 ${gridColsClass}`}>
      {section.columns.map((column, colIndex) => {
        const colColor = column.color || columnColors[colIndex % columnColors.length];
        return (
          <div
            key={colIndex}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                       dark:border-gray-700 overflow-hidden shadow-sm"
          >
            {/* Column header */}
            <div className={`bg-gradient-to-r ${colColor} px-4 py-3`}>
              <h4 className="text-white font-semibold text-center">{column.title}</h4>
            </div>
            {/* Column items */}
            <div className="p-2">
              {column.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-700
                             last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50
                             transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Flow Component - Horizontal or vertical flow with arrows
function FlowRenderer({
  section,
  colorClass,
}: {
  section: FlowSection;
  colorClass: string;
}) {
  const stepColors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
  ];

  const isHorizontal = section.direction !== "vertical";

  return (
    <div
      className={`flex ${isHorizontal ? "flex-row flex-wrap" : "flex-col"}
                  items-center gap-2 justify-center`}
    >
      {section.steps.map((step, index) => {
        const bgColor = step.color || stepColors[index % stepColors.length];
        return (
          <div key={index} className="flex items-center gap-2">
            {/* Step box */}
            <div
              className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-md
                          min-w-[100px] text-center`}
            >
              <div className="font-medium text-sm">{step.label}</div>
              {step.description && (
                <div className="text-xs opacity-80 mt-0.5">{step.description}</div>
              )}
            </div>
            {/* Arrow (except for last item) */}
            {index < section.steps.length - 1 && (
              <div className="text-gray-400 dark:text-gray-500">
                {isHorizontal ? (
                  <ArrowRight className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5 rotate-90" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Cards Component - Grid of cards
function CardsRenderer({
  section,
  colorClass,
}: {
  section: CardsSection;
  colorClass: string;
}) {
  const columns = section.columns || 2;
  const isGrid = section.layout !== "list";

  const badgeColors: Record<string, string> = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  };

  const gridColsClass = columns === 2
    ? "md:grid-cols-2"
    : columns === 3
    ? "md:grid-cols-3"
    : "md:grid-cols-4";

  return (
    <div
      className={
        isGrid
          ? `grid gap-4 ${gridColsClass}`
          : "space-y-3"
      }
    >
      {section.items.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                     dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {card.title}
            </h4>
            {card.badge && (
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full
                            ${badgeColors[card.badgeColor || "blue"]}`}
              >
                {card.badge}
              </span>
            )}
          </div>
          {card.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {card.description}
            </p>
          )}
          {card.points && card.points.length > 0 && (
            <ul className="space-y-1.5">
              {card.points.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// Table Component
function TableRenderer({
  section,
}: {
  section: TableSection;
  colorClass: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {section.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900
                           dark:text-white border-b border-gray-200 dark:border-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {section.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-100 dark:border-gray-800 last:border-b-0
                         hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-4 py-3 text-sm ${
                    cellIndex === 0 && section.highlightFirst
                      ? "font-medium text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// List Component
function ListRenderer({
  section,
  colorClass,
}: {
  section: ListSection;
  colorClass: string;
}) {
  const style = section.style || "bullet";

  const getIcon = (index: number) => {
    if (style === "numbered") {
      return (
        <span
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center
                      rounded-full bg-gradient-to-br ${colorClass} text-white text-xs font-bold`}
        >
          {index + 1}
        </span>
      );
    }
    if (style === "check") {
      return <Check className="w-5 h-5 text-green-500 flex-shrink-0" />;
    }
    return <Circle className="w-2 h-2 text-gray-400 flex-shrink-0 mt-2" />;
  };

  return (
    <ul className="space-y-3">
      {section.items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          {getIcon(index)}
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
            {item.description && (
              <span className="text-gray-600 dark:text-gray-400">
                {" - "}
                {item.description}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Text Component
function TextRenderer({ section }: { section: TextSection }) {
  return (
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
      {section.content}
    </p>
  );
}

// Main Section Renderer
export function SectionRenderer({
  section,
  colorClass = "from-blue-500 to-cyan-500",
  locale = "zh"
}: SectionRendererProps) {
  const renderContent = () => {
    switch (section.type) {
      case "keyPoints":
        return <KeyPointsRenderer section={section} colorClass={colorClass} />;
      case "comparison":
        return <ComparisonRenderer section={section} colorClass={colorClass} />;
      case "flow":
        return <FlowRenderer section={section} colorClass={colorClass} />;
      case "cards":
        return <CardsRenderer section={section} colorClass={colorClass} />;
      case "table":
        return <TableRenderer section={section} colorClass={colorClass} />;
      case "list":
        return <ListRenderer section={section} colorClass={colorClass} />;
      case "text":
        return <TextRenderer section={section} />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-10 last:mb-0">
      {section.title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span
            className={`w-1 h-6 rounded-full bg-gradient-to-b ${colorClass}`}
          />
          {section.title}
        </h3>
      )}
      {section.subtitle && (
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 -mt-2">
          {section.subtitle}
        </p>
      )}
      {renderContent()}
    </div>
  );
}

export default SectionRenderer;
