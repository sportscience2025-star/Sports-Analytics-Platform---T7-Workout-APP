/**
 * src/hooks/useRAGKnowledge.ts
 * Custom Hook per la ricerca, filtraggio e consultazione RAG delle evidenze scientifiche.
 *
 * Conforme a:
 * - Regola R3: Logica isolata dal componente visuale.
 * - Regola R1: Zero any, tipizzazione con ScientificSource da src/types/rag.
 * - Regola 01: Zero emoji spontanee.
 */

import { useState, useMemo, useCallback } from 'react';
import type { ScientificSource, ExecutiveSummary } from '../types/rag';
import { scientificSources } from '../data/sources';

export interface UseRAGKnowledgeProps {
  initialPageSize?: number;
}

export interface UseRAGKnowledgeReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedStudyType: string;
  setSelectedStudyType: (studyType: string) => void;
  page: number;
  setPage: (page: number) => void;

  areas: string[];
  studyTypes: string[];

  filteredSources: ScientificSource[];
  paginatedSources: ScientificSource[];
  totalCount: number;
  totalPages: number;

  executiveSummary: ExecutiveSummary | null;
  resetFilters: () => void;
}

export function useRAGKnowledge({ initialPageSize = 8 }: UseRAGKnowledgeProps = {}): UseRAGKnowledgeReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('Tutte');
  const [selectedStudyType, setSelectedStudyType] = useState<string>('Tutti');
  const [page, setPage] = useState<number>(1);
  const pageSize = initialPageSize;

  // Aree tematiche uniche disponibili
  const areas = useMemo(() => {
    const set = new Set<string>();
    scientificSources.forEach((s) => {
      if (s.area) set.add(s.area);
    });
    return Array.from(set).sort();
  }, []);

  // Tipologie di studio uniche
  const studyTypes = useMemo(() => {
    const set = new Set<string>();
    scientificSources.forEach((s) => {
      if (s.studyType) set.add(s.studyType);
    });
    return Array.from(set).sort();
  }, []);

  // Filtraggio testuale e per attributi
  const filteredSources = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return scientificSources.filter((s) => {
      const matchArea = selectedArea === 'Tutte' || s.area === selectedArea;
      const matchType = selectedStudyType === 'Tutti' || s.studyType === selectedStudyType;

      if (!matchArea || !matchType) return false;
      if (!q) return true;

      const titleMatch = s.title.toLowerCase().includes(q);
      const authorsMatch = s.authors.toLowerCase().includes(q);
      const journalMatch = s.journal.toLowerCase().includes(q);
      const abstractMatch = s.abstract.toLowerCase().includes(q);
      const idMatch = s.id.toLowerCase().includes(q);

      return titleMatch || authorsMatch || journalMatch || abstractMatch || idMatch;
    });
  }, [searchQuery, selectedArea, selectedStudyType]);

  const totalCount = filteredSources.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Paginazione
  const paginatedSources = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredSources.slice(start, start + pageSize);
  }, [filteredSources, page, pageSize, totalPages]);

  // Executive Summary sintetico basato sulle evidenze recuperate
  const executiveSummary = useMemo<ExecutiveSummary | null>(() => {
    if (!searchQuery.trim() || filteredSources.length === 0) return null;

    const topSources = filteredSources.slice(0, 5);
    const journals = Array.from(new Set(topSources.map((s) => s.journal))).slice(0, 3);

    const practicalTakeaways: string[] = topSources.map((s) => {
      // Estrae la prima frase significativa dell'abstract
      const firstSentence = s.abstract.split('.')[0] + '.';
      return `${s.authors.split(',')[0]} (${s.year}): ${firstSentence}`;
    });

    const physiologicalMechanisms: string[] = topSources
      .map((s) => s.area)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((area) => `Evidenze nell'ambito: ${area}`);

    const extractedMetrics: Array<{ label: string; value: string }> = [
      { label: 'Studi Correlati', value: `${filteredSources.length}` },
      { label: 'Anno Più Recente', value: `${Math.max(...topSources.map((s) => s.year))}` },
      { label: 'Principali Riviste', value: journals.join(', ') || 'N/D' }
    ];

    return {
      overviewText: `Interrogazione RAG per "${searchQuery}": individuate ${filteredSources.length} evidenze scientifiche indicizzate in ${areas.length} discipline sportive.`,
      physiologicalMechanisms,
      practicalTakeaways,
      extractedMetrics,
      sourceCount: filteredSources.length
    };
  }, [searchQuery, filteredSources, areas.length]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedArea('Tutte');
    setSelectedStudyType('Tutti');
    setPage(1);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    selectedStudyType,
    setSelectedStudyType,
    page,
    setPage,

    areas,
    studyTypes,

    filteredSources,
    paginatedSources,
    totalCount,
    totalPages,

    executiveSummary,
    resetFilters
  };
}
