export interface Collection {
  id: string;
  name: string;
  folders: Folder[];
  requests: ApiRequest[];
}

export interface Folder {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'xml' | 'text' | 'html' | 'form-data' | 'form-urlencoded';

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  /** Key-value pairs for form-urlencoded or form-data */
  formData?: KeyValuePair[];
}

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: number;
}

export const METHOD_COLORS: Record<string, string> = {
  GET: 'text-method-get',
  POST: 'text-method-post',
  PUT: 'text-method-put',
  DELETE: 'text-method-delete',
  PATCH: 'text-method-patch',
  HEAD: 'text-method-head',
  OPTIONS: 'text-method-options',
};

export const METHOD_BG_COLORS: Record<string, string> = {
  GET: 'bg-method-get/15 text-method-get',
  POST: 'bg-method-post/15 text-method-post',
  PUT: 'bg-method-put/15 text-method-put',
  DELETE: 'bg-method-delete/15 text-method-delete',
  PATCH: 'bg-method-patch/15 text-method-patch',
  HEAD: 'bg-method-head/15 text-method-head',
  OPTIONS: 'bg-method-options/15 text-method-options',
};
