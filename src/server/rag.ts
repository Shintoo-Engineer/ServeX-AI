import { CompanyDocument, DocumentChunk } from '../types/index.ts';

export class RagEngine {
  private chunks: DocumentChunk[] = [];

  constructor(initialChunks: DocumentChunk[] = []) {
    this.chunks = [...initialChunks];
  }

  public setChunks(chunks: DocumentChunk[]) {
    this.chunks = chunks;
  }

  public getChunks(): DocumentChunk[] {
    return this.chunks;
  }

  public chunkText(doc: { id: string; title: string; content: string }): DocumentChunk[] {
    // Break document into coherent paragraphs / sections of 150-300 words
    const cleanContent = doc.content.replace(/\r\n/g, '\n').trim();
    const rawParagraphs = cleanContent.split(/\n\s*\n+/);
    
    const chunks: DocumentChunk[] = [];
    let currentChunkText = '';
    let chunkIndex = 0;

    for (const para of rawParagraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      if ((currentChunkText + '\n\n' + trimmed).split(/\s+/).length > 250) {
        if (currentChunkText.trim()) {
          chunks.push({
            id: `chunk_${doc.id}_${chunkIndex}`,
            docId: doc.id,
            title: doc.title,
            content: currentChunkText.trim(),
            chunkIndex,
            keywords: this.extractKeywords(currentChunkText),
          });
          chunkIndex++;
          currentChunkText = trimmed;
        } else {
          currentChunkText = trimmed;
        }
      } else {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${trimmed}` : trimmed;
      }
    }

    if (currentChunkText.trim()) {
      chunks.push({
        id: `chunk_${doc.id}_${chunkIndex}`,
        docId: doc.id,
        title: doc.title,
        content: currentChunkText.trim(),
        chunkIndex,
        keywords: this.extractKeywords(currentChunkText),
      });
    }

    return chunks;
  }

  public extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by',
      'of', 'or', 'as', 'if', 'this', 'that', 'it', 'be', 'are', 'was', 'were', 'have',
      'has', 'had', 'do', 'does', 'did', 'but', 'not', 'can', 'could', 'should', 'would',
      'our', 'you', 'your', 'we', 'they', 'their', 'from', 'into', 'upon'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    const freqMap = new Map<string, number>();
    for (const w of words) {
      freqMap.set(w, (freqMap.get(w) || 0) + 1);
    }

    return Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(entry => entry[0]);
  }

  public retrieve(query: string, topK: number = 3): { chunk: DocumentChunk; score: number }[] {
    if (this.chunks.length === 0) return [];

    const queryTerms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scored = this.chunks.map(chunk => {
      let score = 0;
      const lowerContent = chunk.content.toLowerCase();
      const lowerTitle = chunk.title.toLowerCase();

      // Title match bonus
      for (const term of queryTerms) {
        if (lowerTitle.includes(term)) {
          score += 3.5;
        }
      }

      // Keyword match
      for (const term of queryTerms) {
        if (chunk.keywords.includes(term)) {
          score += 2.0;
        }
      }

      // Exact substring occurrence
      for (const term of queryTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
          score += matches.length * 1.0;
        }
      }

      // Proximity phrase matching for 2-grams
      for (let i = 0; i < queryTerms.length - 1; i++) {
        const bigram = `${queryTerms[i]} ${queryTerms[i + 1]}`;
        if (lowerContent.includes(bigram)) {
          score += 4.0;
        }
      }

      return { chunk, score };
    });

    // Normalize and sort
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
