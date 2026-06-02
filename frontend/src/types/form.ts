export type FormSchema = {
  formTitle?: string;
  targetEmail?: string;
  fields?: Array<{
    id: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
  }>;
};
