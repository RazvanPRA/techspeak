import { PromptGroupSeedSchema } from '../model/schemas';
import type { PromptGroup, ScenarioPrompt } from '../model/types';
import type { PromptRepository } from './PromptRepository';

/** Prompts from the generated prompts.json, validated once. Ids are "<deckId>-<n>". */
export class SeedPromptRepository implements PromptRepository {
  private readonly groups: PromptGroup[];
  private readonly byId: ReadonlyMap<string, ScenarioPrompt>;

  constructor(seed: readonly unknown[]) {
    this.groups = seed.map(raw => {
      const { topic, deckId, prompts } = PromptGroupSeedSchema.parse(raw);
      return {
        topic,
        deckId,
        prompts: prompts.map((text, i) => ({ id: `${deckId}-${i + 1}`, deckId, topic, text })),
      };
    });
    this.byId = new Map(this.groups.flatMap(g => g.prompts).map(p => [p.id, p]));
  }

  listGroups(): PromptGroup[] {
    return this.groups;
  }

  getPrompt(id: string): ScenarioPrompt | undefined {
    return this.byId.get(id);
  }
}
