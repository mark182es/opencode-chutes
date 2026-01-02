export interface ChutesModelPermission {
  id: string;
  group: string | null;
  object: 'model_permission';
  created: number;
  allow_view: boolean;
  is_blocking: boolean;
  organization: string;
  allow_logprobs: boolean;
  allow_sampling: boolean;
  allow_fine_tuning: boolean;
  allow_create_engine: boolean;
  allow_search_indices: boolean;
}

export interface ChutesModelPricing {
  input: {
    tao: number;
    usd: number;
  };
  output: {
    tao: number;
    usd: number;
  };
}

export interface ChutesModel {
  id: string;
  root: string;
  price?: ChutesModelPricing;
  pricing: {
    prompt: number;
    completion: number;
  };
  object: 'model';
  parent: string | null;
  created: number;
  chute_id: string;
  owned_by: string;
  quantization?: string;
  max_model_len?: number;
  context_length?: number;
  input_modalities: string[];
  max_output_length?: number;
  output_modalities: string[];
  supported_features: string[];
  confidential_compute: boolean;
  supported_sampling_parameters?: string[];
  permission?: ChutesModelPermission[];
}

export interface ChutesModelsResponse {
  object: 'list';
  data: ChutesModel[];
}

export interface ChutesModelDisplayInfo {
  id: string;
  originalId: string;
  displayName: string;
  ownedBy: string;
  pricing: {
    promptPer1M: number;
    completionPer1M: number;
  };
  quantization?: string;
  contextLength: number;
  features: string[];
  supportsConfidentialCompute: boolean;
  inputModalities: string[];
  outputModalities: string[];
}

export function toDisplayInfo(model: ChutesModel): ChutesModelDisplayInfo {
  return {
    id: `chutes/${model.id}`,
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
