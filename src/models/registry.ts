import type { ChutesModel, ChutesModelDisplayInfo } from './types';

export class ModelRegistry {
  private models: Map<string, ChutesModel> = new Map();
  private displayInfoMap: Map<string, ChutesModelDisplayInfo> = new Map();
  private prefix: string = 'chutes';

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  getPrefix(): string {
    return this.prefix;
  }

  register(model: ChutesModel): void {
    this.models.set(model.id, model);
    const displayInfo = this.toDisplayInfo(model);
    this.displayInfoMap.set(displayInfo.id, displayInfo);
  }

  registerAll(models: ChutesModel[]): void {
    for (const model of models) {
      this.register(model);
    }
  }

  unregister(modelId: string): boolean {
    const model = this.models.get(modelId);
    if (!model) {
      return false;
    }

    this.models.delete(modelId);
    const displayId = this.toDisplayInfo(model).id;
    this.displayInfoMap.delete(displayId);
    return true;
  }

  clear(): void {
    this.models.clear();
    this.displayInfoMap.clear();
  }

  get(modelId: string): ChutesModel | undefined {
    return this.models.get(modelId);
  }

  getDisplayInfo(displayId: string): ChutesModelDisplayInfo | undefined {
    return this.displayInfoMap.get(displayId);
  }

  getDisplayId(originalId: string): string {
    return `${this.prefix}/${originalId}`;
  }

  getOriginalId(displayId: string): string | undefined {
    const prefixWithSlash = `${this.prefix}/`;
    if (!displayId.startsWith(prefixWithSlash)) {
      return undefined;
    }
    return displayId.slice(prefixWithSlash.length);
  }

  isChutesModel(modelId: string): boolean {
    return modelId.startsWith(`${this.prefix}/`);
  }

  toDisplayInfo(model: ChutesModel): ChutesModelDisplayInfo {
    return {
      id: this.getDisplayId(model.id),
      originalId: model.id,
      displayName: model.id,
      ownedBy: model.owned_by,
      pricing: {
        promptPer1M: model.pricing.prompt,
        completionPer1M: model.pricing.completion,
      },
      quantization: model.quantization,
      contextLength: model.max_model_len || model.context_length || 32768,
      features: model.supported_features || [],
      supportsConfidentialCompute: model.confidential_compute,
      inputModalities: model.input_modalities,
      outputModalities: model.output_modalities,
    };
  }

  getAll(): ChutesModel[] {
    return Array.from(this.models.values());
  }

  getAllDisplayInfo(): ChutesModelDisplayInfo[] {
    return Array.from(this.displayInfoMap.values());
  }

  size(): number {
    return this.models.size;
  }

  filter(predicate: (_model: ChutesModel) => boolean): ChutesModel[] {
    return this.getAll().filter(predicate);
  }

  findByFeature(feature: string): ChutesModel[] {
    return this.filter((_model) => _model.supported_features.includes(feature));
  }

  findByOwner(owner: string): ChutesModel[] {
    return this.filter((_model) => _model.owned_by === owner);
  }
}
