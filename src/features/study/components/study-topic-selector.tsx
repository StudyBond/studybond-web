"use client";

import { useState, useMemo } from "react";
import type { SubjectTopicTree, TopicFamilyInfo, SubtopicInfo } from "@/lib/api/study";
import { cn } from "@/lib/utils/cn";
import { Search, ChevronDown, ChevronUp, Check, Sparkles, BookOpen, Layers, CheckSquare, Square, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudyTopicSelectorProps = {
  subjectTrees: SubjectTopicTree[];
  selectedTopics: string[]; // List of selected topicFamily or rawTopic strings
  onSelectionChange: (topics: string[]) => void;
  isLoading?: boolean;
};

export function StudyTopicSelector({
  subjectTrees,
  selectedTopics,
  onSelectionChange,
  isLoading = false,
}: StudyTopicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>(
    subjectTrees[0]?.subject || "English"
  );
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});

  const activeSubjectTree = useMemo(() => {
    return subjectTrees.find((s) => s.subject === activeSubjectTab) || subjectTrees[0];
  }, [subjectTrees, activeSubjectTab]);

  // Filter topic families by search query
  const filteredTopicFamilies = useMemo(() => {
    if (!activeSubjectTree) return [];
    if (!searchQuery.trim()) return activeSubjectTree.topicFamilies;

    const q = searchQuery.toLowerCase().trim();
    return activeSubjectTree.topicFamilies.filter((family) => {
      const matchFamily = family.topicFamily.toLowerCase().includes(q);
      const matchSubtopic = family.subtopics.some((sub) =>
        sub.name.toLowerCase().includes(q)
      );
      return matchFamily || matchSubtopic;
    });
  }, [activeSubjectTree, searchQuery]);

  function toggleFamilyExpansion(familyKey: string) {
    setExpandedFamilies((prev) => ({
      ...prev,
      [familyKey]: !prev[familyKey],
    }));
  }

  // Check if topic family is selected
  function isFamilySelected(family: TopicFamilyInfo): boolean {
    return selectedTopics.includes(family.topicFamily);
  }

  function toggleFamilySelection(family: TopicFamilyInfo) {
    const isSel = isFamilySelected(family);
    let newSelected: string[];

    if (isSel) {
      // Remove topic family and any of its subtopics/rawTopics
      const toRemove = new Set([
        family.topicFamily,
        ...family.subtopics.flatMap((s) => s.rawTopics),
        ...family.subtopics.map((s) => `${family.topicFamily} - ${s.name}`),
      ]);
      newSelected = selectedTopics.filter((t) => !toRemove.has(t));
    } else {
      // Select topic family
      newSelected = Array.from(new Set([...selectedTopics, family.topicFamily]));
    }
    onSelectionChange(newSelected);
  }

  function isSubtopicSelected(family: TopicFamilyInfo, subtopic: SubtopicInfo): boolean {
    // If family is fully selected, subtopic is included
    if (selectedTopics.includes(family.topicFamily)) return true;
    return subtopic.rawTopics.some((rt) => selectedTopics.includes(rt));
  }

  function toggleSubtopicSelection(family: TopicFamilyInfo, subtopic: SubtopicInfo) {
    const isSel = isSubtopicSelected(family, subtopic);
    let newSelected: string[];

    if (isSel) {
      // If family was selected as a whole, replace family with all other subtopic rawTopics
      let currentSet = new Set(selectedTopics);
      if (currentSet.has(family.topicFamily)) {
        currentSet.delete(family.topicFamily);
        // Add all subtopics EXCEPT this one
        family.subtopics.forEach((s) => {
          if (s.name !== subtopic.name) {
            s.rawTopics.forEach((rt) => currentSet.add(rt));
          }
        });
      } else {
        // Just remove raw topics of this subtopic
        subtopic.rawTopics.forEach((rt) => currentSet.delete(rt));
      }
      newSelected = Array.from(currentSet);
    } else {
      // Add subtopic raw topics
      let currentSet = new Set(selectedTopics);
      subtopic.rawTopics.forEach((rt) => currentSet.add(rt));

      // If all subtopics are now selected, upgrade to full family
      const allSubSelected = family.subtopics.every((s) =>
        s.name === subtopic.name || isSubtopicSelected(family, s)
      );
      if (allSubSelected && family.subtopics.length > 0) {
        family.subtopics.forEach((s) => s.rawTopics.forEach((rt) => currentSet.delete(rt)));
        currentSet.add(family.topicFamily);
      }
      newSelected = Array.from(currentSet);
    }
    onSelectionChange(newSelected);
  }

  function handleSelectAllInSubject() {
    if (!activeSubjectTree) return;
    const subjectFamilyNames = activeSubjectTree.topicFamilies.map((f) => f.topicFamily);
    const combined = Array.from(new Set([...selectedTopics, ...subjectFamilyNames]));
    onSelectionChange(combined);
  }

  function handleClearSubjectSelection() {
    if (!activeSubjectTree) return;
    const subjectFamilyNames = new Set(activeSubjectTree.topicFamilies.map((f) => f.topicFamily));
    activeSubjectTree.topicFamilies.forEach((f) => {
      f.subtopics.forEach((s) => {
        s.rawTopics.forEach((rt) => subjectFamilyNames.add(rt));
      });
    });
    const remaining = selectedTopics.filter((t) => !subjectFamilyNames.has(t));
    onSelectionChange(remaining);
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="h-10 bg-white/[0.04] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-[var(--sb-bg-surface-1)] p-4 sm:p-6 backdrop-blur-xl shadow-xl">
      {/* Header & Subject Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Targeted Topic Selector</h3>
            <p className="text-xs text-white/40">Select specific topics & subtopics to master</p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAllInSubject}
            className="text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 h-8 px-2.5 rounded-lg"
          >
            Select All
          </Button>
          <span className="text-white/20 text-xs">•</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSubjectSelection}
            className="text-xs text-white/40 hover:text-white hover:bg-white/10 h-8 px-2.5 rounded-lg"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Subject Tabs */}
      {subjectTrees.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {subjectTrees.map((tree) => {
            const isActive = activeSubjectTab === tree.subject;
            const countSelectedInSubj = tree.topicFamilies.filter((f) =>
              isFamilySelected(f)
            ).length;

            return (
              <button
                key={tree.subject}
                type="button"
                onClick={() => setActiveSubjectTab(tree.subject)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border",
                  isActive
                    ? "bg-[var(--sb-study-accent)] text-white border-[var(--sb-study-accent)]/50 shadow-md"
                    : "bg-white/[0.03] text-white/60 border-white/[0.04] hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <span>{tree.subject}</span>
                {countSelectedInSubj > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-mono">
                    {countSelectedInSubj}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeSubjectTab} topics & subtopics...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* Topic Families Grid */}
      {filteredTopicFamilies.length === 0 ? (
        <div className="p-8 text-center text-xs text-white/40 space-y-1">
          <BookOpen className="h-6 w-6 mx-auto text-white/20 mb-2" />
          <p>No topics found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredTopicFamilies.map((family) => {
            const familyKey = `${activeSubjectTab}:${family.topicFamily}`;
            const isSel = isFamilySelected(family);
            const isExpanded = expandedFamilies[familyKey];
            const hasSubtopics = family.subtopics.length > 0;

            return (
              <div
                key={family.topicFamily}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden flex flex-col justify-between",
                  isSel
                    ? "bg-[var(--sb-study-accent)]/10 border-[var(--sb-study-accent)]/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "bg-white/[0.02] border-white/[0.04] hover:border-white/10"
                )}
              >
                {/* Topic Header Card */}
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleFamilySelection(family)}
                      className="shrink-0 text-white/80 hover:text-white transition-colors"
                    >
                      {isSel ? (
                        <CheckSquare className="h-4 w-4 text-[var(--sb-study-accent)]" />
                      ) : (
                        <Square className="h-4 w-4 text-white/30" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleFamilySelection(family)}>
                      <h4 className="font-semibold text-xs text-white truncate">
                        {family.topicFamily}
                      </h4>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">
                        {family.totalQuestions} question{family.totalQuestions === 1 ? "" : "s"}
                        {hasSubtopics ? ` • ${family.subtopics.length} subtopic${family.subtopics.length === 1 ? "" : "s"}` : ""}
                      </p>
                    </div>
                  </div>

                  {hasSubtopics && (
                    <button
                      type="button"
                      onClick={() => toggleFamilyExpansion(familyKey)}
                      className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subtopic Chips Drawer */}
                {hasSubtopics && isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-white/[0.04] bg-white/[0.01] space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/30">Subtopics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {family.subtopics.map((subtopic) => {
                        const isSubSel = isSubtopicSelected(family, subtopic);
                        return (
                          <button
                            key={subtopic.name}
                            type="button"
                            onClick={() => toggleSubtopicSelection(family, subtopic)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                              isSubSel
                                ? "bg-[var(--sb-study-accent)]/20 text-indigo-200 border-[var(--sb-study-accent)]/40 font-semibold"
                                : "bg-white/[0.03] text-white/60 border-white/[0.04] hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {isSubSel && <Check className="h-3 w-3 text-indigo-400" />}
                            <span>{subtopic.name}</span>
                            <span className="text-[9px] font-mono text-white/40">({subtopic.questionCount})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Selected Summary */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/60 font-mono">
        <span>Selected: <strong className="text-white">{selectedTopics.length}</strong> topic{selectedTopics.length === 1 ? "" : "s"}</span>
        {selectedTopics.length > 0 && (
          <span className="text-[11px] text-emerald-400 font-sans font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Ready for targeted study
          </span>
        )}
      </div>
    </div>
  );
}
